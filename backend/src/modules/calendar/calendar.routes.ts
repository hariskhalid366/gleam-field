import { Router } from "express";
import { z } from "zod";
import { Booking } from "../../models/booking.model.js";
import { Leave } from "../../models/leave.model.js";
import { Technician } from "../../models/technician.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, objectId } from "../common/query.validation.js";
import * as auditService from "../audit/audit.service.js";

export const calendarRouter = Router();

const rangeQuery = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  technician: objectId.optional(),
});

/**
 * @openapi
 * /admin/calendar:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Dispatch calendar — jobs, leave and per-technician load for a date range
 *     responses:
 *       200: { description: Calendar screen payload }
 */
calendarRouter.get(
  "/",
  authenticate,
  isAdmin,
  validate({ query: rangeQuery }),
  catchAsync(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof rangeQuery>;
    if (q.to < q.from) throw ApiError.badRequest("`to` must be after `from`");

    const bookingFilter = {
      scheduledFor: { $gte: q.from, $lte: q.to },
      ...(q.technician ? { technician: q.technician } : {}),
    };

    const [jobs, leaves, technicians, load] = await Promise.all([
      Booking.find(bookingFilter)
        .populate("customer", "name email phone")
        .populate("service", "name slug")
        .populate({ path: "technician", populate: { path: "user", select: "name" } })
        .sort({ scheduledFor: 1 })
        .lean(),
      Leave.find({
        from: { $lte: q.to },
        to: { $gte: q.from },
        ...(q.technician ? { technician: q.technician } : {}),
      })
        .populate({ path: "technician", populate: { path: "user", select: "name" } })
        .lean(),
      Technician.find({ verificationStatus: "approved" })
        .populate("user", "name avatarUrl")
        .select("user city isAvailable services")
        .lean(),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: "$technician", jobs: { $sum: 1 }, revenue: { $sum: "$price.total" } } },
      ]),
    ]);

    return sendSuccess(
      res,
      {
        range: { from: q.from, to: q.to },
        jobs,
        leaves,
        technicians,
        load,
        counts: { jobs: jobs.length, leaves: leaves.length, unassigned: jobs.filter((j) => !j.technician).length },
      },
      "Dispatch calendar",
    );
  }),
);

const leaveBody = z.object({
  technician: objectId,
  from: z.coerce.date(),
  to: z.coerce.date(),
  reason: z.string().max(500).optional(),
});

/**
 * @openapi
 * /admin/calendar/leave:
 *   post:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Record technician leave
 *     responses:
 *       201: { description: Leave created }
 */
calendarRouter.post(
  "/leave",
  authenticate,
  isAdmin,
  validate({ body: leaveBody }),
  catchAsync(async (req, res) => {
    if (req.body.to < req.body.from) throw ApiError.badRequest("`to` must be after `from`");
    const leave = await Leave.create({ ...req.body, status: "approved", decidedBy: req.user!.id });
    await auditService.record({
      actor: req.user!.id,
      actorEmail: req.user!.email,
      action: "calendar.leave.created",
      targetType: "Leave",
      targetId: leave._id.toString(),
      ip: req.ip,
    });
    return sendSuccess(res, leave, "Leave recorded", 201);
  }),
);

/**
 * @openapi
 * /admin/calendar/leave/{id}:
 *   patch:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Approve or reject a leave request
 *     responses:
 *       200: { description: Leave updated }
 */
calendarRouter.patch(
  "/leave/:id",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema, body: z.object({ status: z.enum(["pending", "approved", "rejected"]) }) }),
  catchAsync(async (req, res) => {
    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, decidedBy: req.user!.id },
      { new: true },
    );
    if (!updated) throw ApiError.notFound("Leave request not found");
    return sendSuccess(res, updated, "Leave updated");
  }),
);
