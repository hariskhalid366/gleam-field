import { Router } from "express";
import { z } from "zod";
import { Technician, VERIFICATION_STATUSES } from "../../models/technician.model.js";
import { authenticate, authorize, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated, sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, paginationSchema } from "../common/query.validation.js";
import * as auditService from "../audit/audit.service.js";
import * as notificationService from "../notifications/notification.service.js";
import { emitToRoom } from "../../sockets/index.js";
import { logger } from "../../config/logger.js";

export const technicianRouter = Router();

const listQuery = paginationSchema.extend({
  city: z.string().max(80).optional(),
  service: z.string().max(80).optional(),
  status: z.enum(VERIFICATION_STATUSES).optional(),
});

const profileBody = z.object({
  bio: z.string().max(2000).optional(),
  city: z.string().min(2).max(80).optional(),
  services: z.array(z.string().max(80)).max(20).optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  hourlyRate: z.number().min(0).max(10000).optional(),
  isAvailable: z.boolean().optional(),
});

const decisionBody = z.object({
  status: z.enum(["under_review", "approved", "rejected", "suspended"]),
  reviewNotes: z.string().max(2000).optional(),
});

/**
 * @openapi
 * /technicians:
 *   get:
 *     tags: [Technicians]
 *     security: []
 *     summary: Public directory of approved technicians
 *     responses:
 *       200: { description: Paginated technicians }
 */
technicianRouter.get(
  "/",
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const { page, limit, city, service } = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = { verificationStatus: "approved" };
    if (city) filter.city = city;
    if (service) filter.services = service;

    const [items, total] = await Promise.all([
      Technician.find(filter)
        .populate("user", "name avatarUrl city")
        .sort({ rating: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Technician.countDocuments(filter),
    ]);
    return sendPaginated(res, items, { page, limit, total }, "Technicians");
  }),
);

/**
 * @openapi
 * /technicians/me:
 *   patch:
 *     tags: [Technicians]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update own technician profile
 *     responses:
 *       200: { description: Profile updated }
 */
technicianRouter.patch(
  "/me",
  authenticate,
  authorize("technician"),
  validate({ body: profileBody }),
  catchAsync(async (req, res) => {
    const updated = await Technician.findOneAndUpdate({ user: req.user!.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw ApiError.notFound("Technician profile not found");
    return sendSuccess(res, updated, "Profile updated");
  }),
);

/**
 * @openapi
 * /technicians/verification-queue:
 *   get:
 *     tags: [Technicians]
 *     security: [{ bearerAuth: [] }]
 *     summary: Verification queue (admin only)
 *     responses:
 *       200: { description: Paginated applications }
 */
technicianRouter.get(
  "/verification-queue",
  authenticate,
  isAdmin,
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const { page, limit, status } = req.query as unknown as z.infer<typeof listQuery>;
    const filter = { verificationStatus: status ?? { $in: ["pending", "under_review"] } };

    const [items, total] = await Promise.all([
      Technician.find(filter)
        .populate("user", "name email phone city createdAt")
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Technician.countDocuments(filter),
    ]);
    return sendPaginated(res, items, { page, limit, total }, "Verification queue");
  }),
);

/**
 * @openapi
 * /technicians/{id}/verification:
 *   patch:
 *     tags: [Technicians]
 *     security: [{ bearerAuth: [] }]
 *     summary: Approve, reject, suspend or flag a technician application (admin only)
 *     responses:
 *       200: { description: Decision recorded }
 *       404: { description: Not found }
 */
technicianRouter.patch(
  "/:id/verification",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema, body: decisionBody }),
  catchAsync(async (req, res) => {
    const updated = await Technician.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: req.body.status,
        reviewNotes: req.body.reviewNotes,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true },
    );
    if (!updated) throw ApiError.notFound("Technician not found");

    logger.info("Verification decision", {
      technicianId: updated._id?.toString(),
      status: req.body.status,
      by: req.user!.id,
    });
    await auditService.record({
      actor: req.user!.id,
      actorEmail: req.user!.email,
      action: `technician.${req.body.status}`,
      targetType: "Technician",
      targetId: updated._id?.toString(),
      meta: { reviewNotes: req.body.reviewNotes },
      ip: req.ip,
    });
    await notificationService.send({
      userId: updated.user.toString(),
      type: "verification",
      template: req.body.status === "approved" ? "technician.approved" : undefined,
      title: `Application ${req.body.status}`,
      body: req.body.reviewNotes ?? `Your ServicePro application is now ${req.body.status}.`,
      data: { status: req.body.status },
    });
    emitToRoom(`user:${updated.user.toString()}`, "verification:updated", { status: req.body.status });
    return sendSuccess(res, updated, "Verification decision recorded");
  }),
);

/**
 * @openapi
 * /technicians/{id}:
 *   get:
 *     tags: [Technicians]
 *     security: []
 *     summary: Public technician profile
 *     responses:
 *       200: { description: Technician }
 *       404: { description: Not found }
 */
technicianRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    const tech = await Technician.findById(req.params.id).populate("user", "name avatarUrl city").lean();
    if (!tech || tech.verificationStatus !== "approved") throw ApiError.notFound("Technician not found");
    return sendSuccess(res, tech, "Technician");
  }),
);
