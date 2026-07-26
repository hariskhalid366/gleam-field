import { Router } from "express";
import { Booking } from "../../models/booking.model.js";
import { User } from "../../models/user.model.js";
import { Payment } from "../../models/payment.model.js";
import { Review } from "../../models/review.model.js";
import { SupportTicket } from "../../models/supportTicket.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";

export const adminRouter = Router();

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get aggregated dashboard statistics (admin only)
 *     responses:
 *       200: { description: Aggregated analytics statistics }
 */
adminRouter.get(
  "/stats",
  authenticate,
  isAdmin,
  catchAsync(async (req, res) => {
    // 1. Total & Active Bookings Count
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      status: { $in: ["pending", "assigned", "accepted", "travelling", "in_progress"] },
    });

    // 2. Total Customers & Technicians count
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalTechnicians = await User.countDocuments({ role: "technician" });

    // 3. Active support tickets
    const activeTickets = await SupportTicket.countDocuments({
      status: { $in: ["open", "pending"] },
    });

    // 4. Total revenue from completed payments
    const revenueAggregation = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAggregation[0]?.total ?? 0;

    // 5. Average customer satisfaction rating
    const ratingAggregation = await Review.aggregate([
      { $match: { isHidden: false } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    const averageRating = ratingAggregation[0]?.avgRating ? parseFloat(ratingAggregation[0].avgRating.toFixed(2)) : 0.0;

    return sendSuccess(res, {
      totalBookings,
      activeBookings,
      totalCustomers,
      totalTechnicians,
      activeTickets,
      totalRevenue,
      averageRating,
    }, "Dashboard statistics");
  }),
);
