import { Router } from "express";
import { z } from "zod";
import { Payment, PAYMENT_STATUSES } from "../../models/payment.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated } from "../../utils/response.js";
import { paginationSchema } from "../common/query.validation.js";

export const paymentRouter = Router();

const listQuery = paginationSchema.extend({
  status: z.enum(PAYMENT_STATUSES).optional(),
});

/**
 * @openapi
 * /payments:
 *   get:
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     summary: List all payment transactions (admin only)
 *     responses:
 *       200: { description: Paginated payments }
 */
paymentRouter.get(
  "/",
  authenticate,
  isAdmin,
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const { page, limit, status } = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Payment.find(filter)
        .populate("customer", "name email avatarUrl")
        .populate("booking", "reference status")
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return sendPaginated(res, items, { page, limit, total }, "Payments");
  }),
);
