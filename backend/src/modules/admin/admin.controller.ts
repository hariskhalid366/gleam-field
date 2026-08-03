import type { Request, Response } from "express";
import { AdminService } from "./admin.service.js";
import { sendSuccess, sendPaginated } from "../../utils/response.js";
import { generateAiReportSummary } from "./ai-report.service.js";

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

  static async getReport(req: Request, res: Response) {
    const report = await AdminService.getReportData(req.query.range as "7d" | "30d" | "12m");
    return sendSuccess(res, report, "Report generated");
  }

  static async exportReport(req: Request, res: Response) {
    const report = await AdminService.getReportData(req.query.range as "7d" | "30d" | "12m");
    const rows = [["ServicePro report", report.range], ["From", report.from.toISOString()], ["To", report.to.toISOString()], [], ["Metric", "Value"], ...Object.entries(report.metrics).map(([key, value]) => [key, String(value)]), [], ["Period", "Revenue"], ...report.revenueSeries.map((row) => [row.label, String(row.revenue)]), [], ["Service", "Bookings"], ...report.serviceDistribution.map((row) => [row.name, String(row.value)])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="servicepro-report-${report.range}.csv"`);
    return res.send(csv);
  }

  static async getAiReportSummary(req: Request, res: Response) {
    const report = await AdminService.getReportData(req.query.range as "7d" | "30d" | "12m");
    const summary = await generateAiReportSummary(report);
    return sendSuccess(res, summary, "AI report summary generated");
  }
}
