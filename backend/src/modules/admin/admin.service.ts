import { AdminRepository } from "./admin.repository.js";
import { env } from "../../config/env.js";
import { Booking } from "../../models/booking.model.js";
import { Payment } from "../../models/payment.model.js";
import { Review } from "../../models/review.model.js";
import { Service } from "../../models/service.model.js";
import { Technician } from "../../models/technician.model.js";
import { User } from "../../models/user.model.js";

export class AdminService {
  static async getReportData(range: "7d" | "30d" | "12m") {
    const now = new Date();
    const start = new Date(now);
    if (range === "7d") start.setDate(start.getDate() - 6);
    else if (range === "30d") start.setDate(start.getDate() - 29);
    else start.setMonth(start.getMonth() - 11);
    start.setHours(0, 0, 0, 0);
    const dateFormat = range === "12m" ? "%Y-%m" : "%Y-%m-%d";
    const [payments, bookings, customers, cancelled, rating, technicians, revenueSeries, serviceDistribution] = await Promise.all([
      Payment.aggregate([{ $match: { status: "paid", date: { $gte: start } } }, { $group: { _id: null, amount: { $sum: "$amount" }, commission: { $sum: "$commission" }, tax: { $sum: "$tax" } } }]),
      Booking.countDocuments({ createdAt: { $gte: start } }),
      User.countDocuments({ role: "customer", createdAt: { $gte: start } }),
      Booking.countDocuments({ status: "cancelled", createdAt: { $gte: start } }),
      Review.aggregate([{ $match: { isHidden: false, createdAt: { $gte: start } } }, { $group: { _id: null, value: { $avg: "$rating" } } }]),
      Technician.countDocuments({ verificationStatus: "approved" }),
      Payment.aggregate([{ $match: { status: "paid", date: { $gte: start } } }, { $group: { _id: { $dateToString: { format: dateFormat, date: "$date" } }, revenue: { $sum: "$amount" } } }, { $sort: { _id: 1 } }]),
      Booking.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: "$service", value: { $sum: 1 } } }, { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "service" } }, { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } }, { $project: { _id: 0, name: { $ifNull: ["$service.name", "Unknown service"] }, value: 1 } }, { $sort: { value: -1 } }]),
    ]);
    const totalRevenue = payments[0]?.amount ?? 0;
    return { range, from: start, to: now, metrics: { revenue: totalRevenue, commission: payments[0]?.commission ?? 0, tax: payments[0]?.tax ?? 0, bookings, customers, cancellationRate: bookings ? Number((cancelled / bookings * 100).toFixed(1)) : 0, averageRating: Number((rating[0]?.value ?? 0).toFixed(2)), approvedTechnicians: technicians }, revenueSeries: revenueSeries.map((row) => ({ label: row._id, revenue: row.revenue })), serviceDistribution };
  }
  static async getDashboardData(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayRevenue = await AdminRepository.aggregateRevenue({ status: "paid", date: { $gte: today } });
    const monthlyRevenue = await AdminRepository.aggregateRevenue({ status: "paid", date: { $gte: startOfMonth } });

    const todayBookingsCount = await AdminRepository.countBookings({ createdAt: { $gte: today } });
    const pendingBookingsCount = await AdminRepository.countBookings({ status: "pending" });
    const completedBookingsCount = await AdminRepository.countBookings({ status: "completed" });
    const cancelledBookingsCount = await AdminRepository.countBookings({ status: "cancelled" });

    const totalCustomers = await AdminRepository.countUsersByRole("customer");
    const totalTechnicians = await AdminRepository.countUsersByRole("technician");
    const pendingApprovalsCount = await AdminRepository.countTechniciansByStatus("pending");

    const [recentBookings, upcomingJobs, topTechnicians, latestCustomers, latestTechnicians, latestReviews, serviceDistribution] = await Promise.all([
      Booking.find().populate("customer", "name avatarUrl").populate("technician", "user").populate("service", "name").sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find({ scheduledFor: { $gte: today }, status: { $nin: ["completed", "cancelled", "disputed"] } }).populate("customer", "name").populate("technician", "user").populate("service", "name").sort({ scheduledFor: 1 }).limit(5).lean(),
      Technician.find({ verificationStatus: "approved" }).populate("user", "name avatarUrl").sort({ jobsCompleted: -1 }).limit(5).lean(),
      User.find({ role: "customer" }).sort({ createdAt: -1 }).limit(5).lean(),
      Technician.find().populate("user", "name avatarUrl").sort({ createdAt: -1 }).limit(5).lean(),
      Review.find({ isHidden: false }).populate("customer", "name avatarUrl").sort({ createdAt: -1 }).limit(4).lean(),
      Booking.aggregate([{ $match: { status: "completed" } }, { $group: { _id: "$service", value: { $sum: 1 } } }, { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "service" } }, { $unwind: "$service" }, { $project: { _id: 0, name: "$service.name", value: 1 } }, { $sort: { value: -1 } }, { $limit: 6 }]),
    ]);

    const weeklyStart = new Date(today);
    weeklyStart.setDate(today.getDate() - 6);
    const [weeklyRevenue, weeklyBookings] = await Promise.all([
      Payment.aggregate([{ $match: { status: "paid", date: { $gte: weeklyStart } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, revenue: { $sum: "$amount" } } }]),
      Booking.aggregate([{ $match: { scheduledFor: { $gte: weeklyStart } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledFor" } }, bookings: { $sum: 1 } } }]),
    ]);
    const revenueByDay = new Map(weeklyRevenue.map((row) => [row._id, row.revenue]));
    const bookingsByDay = new Map(weeklyBookings.map((row) => [row._id, row.bookings]));
    const weeklySeries = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weeklyStart); date.setDate(weeklyStart.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { label: date.toLocaleDateString("en-US", { weekday: "short" }), revenue: revenueByDay.get(key) ?? 0, bookings: bookingsByDay.get(key) ?? 0 };
    });

    const notifications = [
      { id: "n1", title: `${pendingApprovalsCount} technicians awaiting verification`, category: "Approvals", time: "Just now" },
      { id: "n2", title: "Emergency booking created", category: "Booking Updates", time: "15 min ago" },
      { id: "n3", title: "Payment processed successfully", category: "Payments", time: "45 min ago" },
    ].slice(0, pendingApprovalsCount > 0 ? 3 : 2);

    return {
      revenue: { today: todayRevenue, monthly: monthlyRevenue },
      bookingStats: {
        today: todayBookingsCount,
        pending: pendingBookingsCount,
        completed: completedBookingsCount,
        cancelled: cancelledBookingsCount,
      },
      pendingApprovalsCount,
      totalCustomers,
      totalTechnicians,
      recentBookings,
      upcomingJobs,
      topTechnicians,
      latestCustomers,
      latestTechnicians,
      latestReviews,
      serviceDistribution,
      weeklySeries,
      chartSeries: {
        revenue: weeklySeries.map((row) => ({ label: row.label, value: row.revenue })),
        bookings: weeklySeries.map((row) => ({ label: row.label, value: row.bookings })),
      },
      notifications,
      meta: {
        generatedAt: new Date(),
        environment: env.NODE_ENV,
      },
    };
  }

  static async getStatsData(): Promise<any> {
    const totalBookings = await AdminRepository.countBookings();
    const activeBookings = await AdminRepository.countBookings({
      status: { $in: ["pending", "assigned", "accepted", "travelling", "in_progress"] },
    });

    const totalCustomers = await AdminRepository.countUsersByRole("customer");
    const totalTechnicians = await AdminRepository.countUsersByRole("technician");
    const activeTickets = await AdminRepository.countSupportTickets({ status: { $in: ["open", "pending"] } });

    const totalRevenue = await AdminRepository.aggregateRevenue({ status: "paid" });
    const averageRating = await AdminRepository.aggregateAverageRating();

    return {
      totalBookings,
      activeBookings,
      totalCustomers,
      totalTechnicians,
      activeTickets,
      totalRevenue,
      averageRating,
    };
  }

  static async getBookingsPaginated(
    filter: Record<string, any>,
    page: number,
    limit: number,
  ): Promise<{ items: any[]; total: number; statusCounts: Record<string, number> }> {
    const skip = (page - 1) * limit;
    const [items, total, statusCounts] = await Promise.all([
      AdminRepository.findBookings(filter, skip, limit),
      AdminRepository.countBookings(filter),
      AdminRepository.aggregateBookingCountsPerStatus(),
    ]);

    return { items, total, statusCounts };
  }

  static async getCalendarEvents(year: number, month: number, technicianId?: string): Promise<any[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const filter: Record<string, any> = {
      scheduledFor: { $gte: startDate, $lt: endDate },
    };
    if (technicianId) {
      filter.technician = technicianId;
    }

    const bookings = await AdminRepository.findCalendarBookings(filter);

    return bookings.map((b) => ({
      bookingId: b._id,
      reference: b.reference,
      date: b.scheduledFor,
      title: `${b.service ? (b.service as any).name : "Service"} - ${
        b.customer ? (b.customer as any).name : "Customer"
      }`,
      status: b.status,
    }));
  }
}
