import { Router } from "express";
import { z } from "zod";
import { Booking } from "../../models/booking.model.js";
import { Payment } from "../../models/payment.model.js";
import { Review } from "../../models/review.model.js";
import { User } from "../../models/user.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";

export const reportsRouter = Router();

const reportQuery = z.object({
  from: z.coerce.date().default(() => new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)),
  to: z.coerce.date().default(() => new Date()),
  granularity: z.enum(["day", "month"]).default("month"),
});

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Reporting screen — revenue trend, booking volume, service mix, top technicians
 *     responses:
 *       200: { description: Reports payload }
 */
reportsRouter.get(
  "/",
  authenticate,
  isAdmin,
  validate({ query: reportQuery }),
  catchAsync(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof reportQuery>;
    const range = { $gte: q.from, $lte: q.to };
    const format = q.granularity === "day" ? "%Y-%m-%d" : "%Y-%m";

    const [revenueTrend, bookingTrend, serviceMix, statusMix, topTechnicians, totals, satisfaction] =
      await Promise.all([
        Payment.aggregate([
          { $match: { date: range, status: "paid" } },
          {
            $group: {
              _id: { $dateToString: { format, date: "$date" } },
              revenue: { $sum: "$amount" },
              commission: { $sum: "$commission" },
              tax: { $sum: "$tax" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Booking.aggregate([
          { $match: { createdAt: range } },
          {
            $group: {
              _id: { $dateToString: { format, date: "$createdAt" } },
              bookings: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
              cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Booking.aggregate([
          { $match: { createdAt: range } },
          { $group: { _id: "$service", bookings: { $sum: 1 }, revenue: { $sum: "$price.total" } } },
          { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "service" } },
          { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
          { $project: { name: "$service.name", bookings: 1, revenue: 1 } },
          { $sort: { bookings: -1 } },
        ]),
        Booking.aggregate([
          { $match: { createdAt: range } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Booking.aggregate([
          { $match: { createdAt: range, technician: { $ne: null }, status: "completed" } },
          { $group: { _id: "$technician", jobs: { $sum: 1 }, revenue: { $sum: "$price.total" } } },
          { $sort: { revenue: -1 } },
          { $limit: 10 },
          { $lookup: { from: "technicians", localField: "_id", foreignField: "_id", as: "technician" } },
          { $unwind: "$technician" },
          { $lookup: { from: "users", localField: "technician.user", foreignField: "_id", as: "user" } },
          { $unwind: "$user" },
          { $project: { name: "$user.name", city: "$technician.city", rating: "$technician.rating", jobs: 1, revenue: 1 } },
        ]),
        Promise.all([
          Booking.countDocuments({ createdAt: range }),
          Payment.aggregate([
            { $match: { date: range, status: "paid" } },
            { $group: { _id: null, revenue: { $sum: "$amount" }, commission: { $sum: "$commission" } } },
          ]),
          User.countDocuments({ createdAt: range, role: "customer" }),
          User.countDocuments({ createdAt: range, role: "technician" }),
        ]),
        Review.aggregate([
          { $match: { createdAt: range } },
          { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]),
      ]);

    const [bookingCount, revenueAgg, newCustomers, newTechnicians] = totals;

    return sendSuccess(
      res,
      {
        range: { from: q.from, to: q.to, granularity: q.granularity },
        kpis: {
          bookings: bookingCount,
          revenue: revenueAgg[0]?.revenue ?? 0,
          commission: revenueAgg[0]?.commission ?? 0,
          newCustomers,
          newTechnicians,
          avgRating: Number((satisfaction[0]?.avgRating ?? 0).toFixed(2)),
          reviews: satisfaction[0]?.count ?? 0,
        },
        revenueTrend,
        bookingTrend,
        serviceMix,
        statusMix,
        topTechnicians,
      },
      "Reports",
    );
  }),
);
