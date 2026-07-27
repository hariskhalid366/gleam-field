import { Router } from "express";
import mongoose from "mongoose";
import { authRouter } from "./modules/auth/auth.routes.js";
import { serviceRouter } from "./modules/services/service.routes.js";
import { technicianRouter } from "./modules/technicians/technician.routes.js";
import { bookingRouter } from "./modules/bookings/booking.routes.js";
import { reviewRouter } from "./modules/reviews/review.routes.js";
import { paymentRouter } from "./modules/payments/payment.routes.js";
import { supportRouter } from "./modules/support/support.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { fileRouter } from "./modules/files/file.routes.js";
import { cmsRouter } from "./modules/cms/cms.routes.js";
import { notificationRouter } from "./modules/notifications/notification.routes.js";
import { auditRouter } from "./modules/audit/audit.routes.js";
import { calendarRouter } from "./modules/calendar/calendar.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";
import { settingsRouter } from "./modules/settings/settings.routes.js";

export const apiRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Auth]
 *     security: []
 *     summary: Liveness and database connectivity probe
 *     responses:
 *       200: { description: Service healthy }
 */
apiRouter.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/services", serviceRouter);
apiRouter.use("/technicians", technicianRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/reviews", reviewRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/support", supportRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/files", fileRouter);
apiRouter.use("/cms", cmsRouter);
apiRouter.use("/notifications", notificationRouter);

// Admin-only surfaces
apiRouter.use("/admin", adminRouter);
apiRouter.use("/admin/audit-logs", auditRouter);
apiRouter.use("/admin/calendar", calendarRouter);
apiRouter.use("/admin/reports", reportsRouter);
apiRouter.use("/admin/settings", settingsRouter);
