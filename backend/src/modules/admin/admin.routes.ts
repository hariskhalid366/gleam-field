import { Router } from "express";
import { z } from "zod";
import { BOOKING_STATUSES } from "../../models/booking.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { paginationSchema } from "../common/query.validation.js";
import { AdminController } from "./admin.controller.js";

export const adminRouter = Router();

const bookingsListQuery = paginationSchema.extend({
  status: z.enum(BOOKING_STATUSES).optional(),
  customer: z.string().optional(),
  technician: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const calendarQuery = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  technicianId: z.string().optional(),
});

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get aggregated statistics analytics (admin only)
 *     responses:
 *       200: { description: Analytics stats response }
 */
adminRouter.get("/stats", authenticate, isAdmin, catchAsync(AdminController.getStats));

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get single aggregated admin dashboard response containing revenue, bookings telemetry, quick-actions, and time series charts
 *     responses:
 *       200: { description: Aggregated dashboard response }
 */
adminRouter.get("/dashboard", authenticate, isAdmin, catchAsync(AdminController.getDashboard));

/**
 * @openapi
 * /admin/bookings:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: List all bookings paginated with filters and summary blocks (admin only)
 *     responses:
 *       200: { description: Paginated list of bookings }
 */
adminRouter.get(
  "/bookings",
  authenticate,
  isAdmin,
  validate({ query: bookingsListQuery }),
  catchAsync(AdminController.getBookings),
);

/**
 * @openapi
 * /admin/calendar:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get calendar overview of scheduled bookings for a given month (admin only)
 *     responses:
 *       200: { description: Monthly calendar view data }
 */
adminRouter.get(
  "/calendar",
  authenticate,
  isAdmin,
  validate({ query: calendarQuery }),
  catchAsync(AdminController.getCalendar),
);
