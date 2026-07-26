import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Booking, BOOKING_STATUSES } from "../../models/booking.model.js";
import { Service } from "../../models/service.model.js";
import { Technician } from "../../models/technician.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated, sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, objectId, paginationSchema } from "../common/query.validation.js";
import { emitToRoom } from "../../sockets/index.js";

export const bookingRouter = Router();

const createBody = z.object({
  service: objectId,
  scheduledFor: z.coerce.date().refine((d) => d.getTime() > Date.now() - 60_000, "scheduledFor must be in the future"),
  isEmergency: z.boolean().default(false),
  address: z.object({
    line1: z.string().min(4).max(200),
    city: z.string().min(2).max(80),
    postalCode: z.string().max(20).optional(),
    notes: z.string().max(1000).optional(),
  }),
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).optional(),
});

const listQuery = paginationSchema.extend({
  status: z.enum(BOOKING_STATUSES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const TAX_RATE = 0.085;
const EMERGENCY_SURCHARGE = 0.35;

/**
 * @openapi
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create a booking (price is computed server-side)
 *     responses:
 *       201: { description: Booking created }
 *       400: { description: Validation failed }
 */
bookingRouter.post(
  "/",
  authenticate,
  validate({ body: createBody }),
  catchAsync(async (req, res) => {
    const body = req.body as z.infer<typeof createBody>;
    const service = await Service.findById(body.service);
    if (!service || !service.isActive) throw ApiError.badRequest("Service is unavailable");

    // Never trust client-side pricing.
    const base = body.isEmergency ? service.emergencyPrice : service.basePrice;
    const surcharge = body.isEmergency ? Math.round(base * EMERGENCY_SURCHARGE) : 0;
    const tax = Math.round((base + surcharge) * TAX_RATE);

    const booking = await Booking.create({
      reference: `BKG-${Date.now().toString(36).toUpperCase()}`,
      customer: req.user!.id,
      service: service._id,
      status: "pending",
      isEmergency: body.isEmergency,
      scheduledFor: body.scheduledFor,
      address: body.address,
      ...(body.coordinates ? { location: { type: "Point", coordinates: body.coordinates } } : {}),
      price: { base, surcharge, tax, total: base + surcharge + tax, currency: "USD" },
      timeline: [{ status: "pending", at: new Date(), by: req.user!.id }],
    });

    emitToRoom("admins", "booking:created", { id: booking._id, reference: booking.reference });
    return sendSuccess(res, booking, "Booking created", 201);
  }),
);

/**
 * @openapi
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     summary: List bookings — scoped to the caller unless admin
 *     responses:
 *       200: { description: Paginated bookings }
 */
bookingRouter.get(
  "/",
  authenticate,
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const { page, limit, status, from, to } = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};

    // Ownership scoping happens server-side; clients cannot widen it.
    if (req.user!.role === "customer") filter.customer = req.user!.id;
    if (req.user!.role === "technician") {
      const tech = await Technician.findOne({ user: req.user!.id }).select("_id");
      filter.technician = tech?._id ?? new mongoose.Types.ObjectId();
    }
    if (status) filter.status = status;
    if (from || to) filter.scheduledFor = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .populate("service", "name slug")
        .populate("customer", "name email city")
        .sort({ scheduledFor: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);
    return sendPaginated(res, items, { page, limit, total }, "Bookings");
  }),
);

/**
 * @openapi
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     summary: Booking detail (owner, assigned technician or admin)
 *     responses:
 *       200: { description: Booking }
 *       403: { description: Forbidden }
 */
bookingRouter.get(
  "/:id",
  authenticate,
  validate({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
      .populate("service", "name slug")
      .populate("customer", "name email phone city");
    if (!booking) throw ApiError.notFound("Booking not found");

    const isAdminRole = req.user!.role === "admin" || req.user!.role === "super_admin";
    const isOwner = booking.customer._id.toString() === req.user!.id;
    let isAssigned = false;
    if (req.user!.role === "technician" && booking.technician) {
      const tech = await Technician.findOne({ user: req.user!.id }).select("_id");
      isAssigned = tech?._id.toString() === booking.technician.toString();
    }
    if (!isAdminRole && !isOwner && !isAssigned) throw ApiError.forbidden("Not your booking");

    return sendSuccess(res, booking, "Booking");
  }),
);

/**
 * @openapi
 * /bookings/{id}/assign:
 *   patch:
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     summary: Assign a verified technician (admin only)
 *     responses:
 *       200: { description: Technician assigned }
 */
bookingRouter.patch(
  "/:id/assign",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema, body: z.object({ technician: objectId }) }),
  catchAsync(async (req, res) => {
    const tech = await Technician.findById(req.body.technician);
    if (!tech) throw ApiError.notFound("Technician not found");
    if (tech.verificationStatus !== "approved") throw ApiError.badRequest("Technician is not verified");

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        technician: tech._id,
        status: "assigned",
        $push: { timeline: { status: "assigned", at: new Date(), by: req.user!.id } },
      },
      { new: true },
    );
    if (!booking) throw ApiError.notFound("Booking not found");

    emitToRoom(`user:${tech.user.toString()}`, "booking:assigned", { id: booking._id, reference: booking.reference });
    return sendSuccess(res, booking, "Technician assigned");
  }),
);

/**
 * @openapi
 * /bookings/{id}/status:
 *   patch:
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     summary: Advance booking status (admin or assigned technician)
 *     responses:
 *       200: { description: Status updated }
 */
bookingRouter.patch(
  "/:id/status",
  authenticate,
  validate({
    params: idParamSchema,
    body: z.object({ status: z.enum(BOOKING_STATUSES), note: z.string().max(500).optional() }),
  }),
  catchAsync(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw ApiError.notFound("Booking not found");

    const isAdminRole = req.user!.role === "admin" || req.user!.role === "super_admin";
    if (!isAdminRole) {
      const tech = await Technician.findOne({ user: req.user!.id }).select("_id");
      const isAssigned = tech && booking.technician && tech._id.toString() === booking.technician.toString();
      const isOwnerCancelling = booking.customer.toString() === req.user!.id && req.body.status === "cancelled";
      if (!isAssigned && !isOwnerCancelling) throw ApiError.forbidden("Not allowed to change this booking");
    }

    booking.status = req.body.status;
    booking.timeline.push({
      status: req.body.status,
      at: new Date(),
      by: new mongoose.Types.ObjectId(req.user!.id),
      note: req.body.note,
    });
    await booking.save();

    emitToRoom(`booking:${booking._id.toString()}`, "booking:status", { status: booking.status });
    return sendSuccess(res, booking, "Status updated");
  }),
);
