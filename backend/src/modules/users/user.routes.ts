import { Router } from "express";
import { z } from "zod";
import { User, USER_ROLES } from "../../models/user.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated, sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, paginationSchema } from "../common/query.validation.js";

export const userRouter = Router();

const listQuery = paginationSchema.extend({
  role: z.enum(USER_ROLES).optional(),
  isActive: z.coerce.boolean().optional(),
});

const updateStatusBody = z.object({
  isActive: z.boolean(),
});

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: List all users/customers (admin only)
 *     responses:
 *       200: { description: Paginated users }
 */
userRouter.get(
  "/",
  authenticate,
  isAdmin,
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const { page, limit, role, isActive, q } = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, items, { page, limit, total }, "Users");
  }),
);

/**
 * @openapi
 * /users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Suspend or activate a user account (admin only)
 *     responses:
 *       200: { description: User status updated }
 */
userRouter.patch(
  "/:id/status",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema, body: updateStatusBody }),
  catchAsync(async (req, res) => {
    const { isActive } = req.body as z.infer<typeof updateStatusBody>;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!user) throw ApiError.notFound("User not found");

    // If deactivating, also invalidate their current session families
    if (!isActive) {
      user.tokenVersion += 1;
      await user.save();
    }

    return sendSuccess(res, user, `User status updated to ${isActive ? "active" : "suspended"}`);
  }),
);
