import { Router } from "express";
import mongoose from "mongoose";
import { authRouter } from "./modules/auth/auth.routes.js";
import { serviceRouter } from "./modules/services/service.routes.js";
import { technicianRouter } from "./modules/technicians/technician.routes.js";
import { bookingRouter } from "./modules/bookings/booking.routes.js";
import { reviewRouter } from "./modules/reviews/review.routes.js";

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
