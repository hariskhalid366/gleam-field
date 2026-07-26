import type { Request, Response } from "express";
import { AdminService } from "./admin.service.js";
import { sendSuccess, sendPaginated } from "../../utils/response.js";

export class AdminController {
  static async getDashboard(req: Request, res: Response) {
    const data = await AdminService.getDashboardData();
    return sendSuccess(res, data, "Admin Dashboard aggregation");
  }

  static async getStats(req: Request, res: Response) {
    const data = await AdminService.getStatsData();
    return sendSuccess(res, data, "Dashboard statistics");
  }

  static async getBookings(req: Request, res: Response) {
    const { page, limit, status, customer, technician, from, to } = req.query as any;
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (technician) filter.technician = technician;
    if (from || to) {
      filter.scheduledFor = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      };
    }

    const { items, total, statusCounts } = await AdminService.getBookingsPaginated(filter, page, limit);

    return sendPaginated(
      res,
      items,
      { page, limit, total },
      "Admin Bookings list",
      { statusCounts },
    );
  }

  static async getCalendar(req: Request, res: Response) {
    const { year, month, technicianId } = req.query as any;
    const events = await AdminService.getCalendarEvents(year, month, technicianId);
    return sendSuccess(res, { year, month, events }, "Admin Monthly Calendar data");
  }
}
