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
import { filesRouter } from "./modules/files/files.routes.js";
import { contentRouter } from "./modules/content/content.routes.js";

export const apiRouter = Router();

/**
 * @openapi
 * /:
 *   get:
 *     tags: [Auth]
 *     security: []
 *     summary: Welcome index route
 *     responses:
 *       200: { description: Welcome message }
 */
apiRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to the ServicePro API!",
    status: "healthy",
    docs: "/docs",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    version: "1.0.0",
  });
});

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
apiRouter.use("/admin", adminRouter);
apiRouter.use("/files", filesRouter);
apiRouter.use("/content", contentRouter);
