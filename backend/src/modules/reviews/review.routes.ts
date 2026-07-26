import { Router } from "express";
import { z } from "zod";
import { Review } from "../../models/review.model.js";
import { Booking } from "../../models/booking.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated, sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, objectId, paginationSchema } from "../common/query.validation.js";

export const reviewRouter = Router();

/**
 * @openapi
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     security: []
 *     summary: Public, non-hidden reviews
 *     responses:
 *       200: { description: Paginated reviews }
 */
reviewRouter.get(
  "/",
  validate({ query: paginationSchema.extend({ technician: objectId.optional() }) }),
  catchAsync(async (req, res) => {
    const { page, limit, technician } = req.query as unknown as { page: number; limit: number; technician?: string };
    const filter: Record<string, unknown> = { isHidden: false };
    if (technician) filter.technician = technician;

    const [items, total] = await Promise.all([
      Review.find(filter)
        .populate("customer", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);
    return sendPaginated(res, items, { page, limit, total }, "Reviews");
  }),
);

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     summary: Review a completed booking you own
 *     responses:
 *       201: { description: Review created }
 *       400: { description: Booking not completed }
 */
reviewRouter.post(
  "/",
  authenticate,
  validate({
    body: z.object({ booking: objectId, rating: z.number().int().min(1).max(5), comment: z.string().max(2000).optional() }),
  }),
  catchAsync(async (req, res) => {
    const booking = await Booking.findById(req.body.booking);
    if (!booking) throw ApiError.notFound("Booking not found");
    if (booking.customer.toString() !== req.user!.id) throw ApiError.forbidden("Not your booking");
    if (booking.status !== "completed") throw ApiError.badRequest("Only completed bookings can be reviewed");
    if (!booking.technician) throw ApiError.badRequest("Booking has no assigned technician");

    const review = await Review.create({
      booking: booking._id,
      customer: req.user!.id,
      technician: booking.technician,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    return sendSuccess(res, review, "Review submitted", 201);
  }),
);

/**
 * @openapi
 * /reviews/{id}/moderate:
 *   patch:
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     summary: Hide, unhide or clear the report flag on a review (admin only)
 *     responses:
 *       200: { description: Review moderated }
 */
reviewRouter.patch(
  "/:id/moderate",
  authenticate,
  isAdmin,
  validate({
    params: idParamSchema,
    body: z.object({ isHidden: z.boolean().optional(), isReported: z.boolean().optional() }),
  }),
  catchAsync(async (req, res) => {
    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { ...req.body, moderatedBy: req.user!.id },
      { new: true },
    );
    if (!updated) throw ApiError.notFound("Review not found");
    return sendSuccess(res, updated, "Review moderated");
  }),
);
