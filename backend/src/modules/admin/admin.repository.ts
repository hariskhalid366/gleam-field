import { Booking } from "../../models/booking.model.js";
import { User } from "../../models/user.model.js";
import { Technician } from "../../models/technician.model.js";
import { Payment } from "../../models/payment.model.js";
import { Review } from "../../models/review.model.js";
import { SupportTicket } from "../../models/supportTicket.model.js";

export class AdminRepository {
  static async countBookings(filter: Record<string, any> = {}): Promise<number> {
    return await Booking.countDocuments(filter);
  }

  static async aggregateRevenue(matchFilter: Record<string, any>): Promise<number> {
    const result = await Payment.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async countUsersByRole(role: string): Promise<number> {
    return await User.countDocuments({ role });
  }

  static async countTechniciansByStatus(status: string): Promise<number> {
    return await Technician.countDocuments({ verificationStatus: status });
  }

  static async countSupportTickets(filter: Record<string, any> = {}): Promise<number> {
    return await SupportTicket.countDocuments(filter);
  }

  static async findRecentBookings(limit: number): Promise<any[]> {
    return await Booking.find()
      .populate("customer", "name email avatarUrl")
      .populate("service", "name basePrice")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async aggregateAverageRating(): Promise<number> {
    const result = await Review.aggregate([
      { $match: { isHidden: false } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    return result[0]?.avgRating ? parseFloat(result[0].avgRating.toFixed(2)) : 0.0;
  }

  static async findBookings(
    filter: Record<string, any>,
    skip: number,
    limit: number,
  ): Promise<any[]> {
    return await Booking.find(filter)
      .populate("customer", "name email phone avatarUrl")
      .populate("service", "name slug basePrice icon")
      .sort({ scheduledFor: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  static async aggregateBookingCountsPerStatus(): Promise<Record<string, number>> {
    const results = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(results.map((c) => [c._id, c.count]));
  }

  static async findCalendarBookings(filter: Record<string, any>): Promise<any[]> {
    return await Booking.find(filter)
      .populate("customer", "name")
      .populate("service", "name")
      .select("scheduledFor status customer service reference")
      .lean();
  }
}
