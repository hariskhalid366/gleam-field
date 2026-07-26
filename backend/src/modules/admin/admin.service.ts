import { AdminRepository } from "./admin.repository.js";
import { env } from "../../config/env.js";

export class AdminService {
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

    const recentBookings = await AdminRepository.findRecentBookings(10);

    const notifications = [
      { id: "n1", title: `${pendingApprovalsCount} technicians awaiting verification`, category: "Approvals", time: "Just now" },
      { id: "n2", title: "Emergency booking created", category: "Booking Updates", time: "15 min ago" },
      { id: "n3", title: "Payment processed successfully", category: "Payments", time: "45 min ago" },
    ].slice(0, pendingApprovalsCount > 0 ? 3 : 2);

    const chartSeries = {
      revenue: [
        { label: "Mon", value: 420 },
        { label: "Tue", value: 580 },
        { label: "Wed", value: 310 },
        { label: "Thu", value: 890 },
        { label: "Fri", value: 650 },
        { label: "Sat", value: 920 },
        { label: "Sun", value: todayRevenue },
      ],
      bookings: [
        { label: "Mon", value: 4 },
        { label: "Tue", value: 6 },
        { label: "Wed", value: 3 },
        { label: "Thu", value: 8 },
        { label: "Fri", value: 5 },
        { label: "Sat", value: 9 },
        { label: "Sun", value: todayBookingsCount },
      ],
    };

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
      notifications,
      chartSeries,
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
