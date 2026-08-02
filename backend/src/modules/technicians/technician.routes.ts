import { Router } from "express";
import crypto from "node:crypto";
import multer from "multer";
import { z } from "zod";
import { Technician, VERIFICATION_STATUSES } from "../../models/technician.model.js";
import { User } from "../../models/user.model.js";
import { authenticate, authorize, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated, sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, paginationSchema } from "../common/query.validation.js";
import { emitToRoom } from "../../sockets/index.js";
import { logger } from "../../config/logger.js";
import { FilesService } from "../files/files.service.js";
import { notifyAdmins } from "../notifications/notifications.service.js";

export const technicianRouter = Router();
const applicationUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const listQuery = paginationSchema.extend({
  city: z.string().max(80).optional(),
  service: z.string().max(80).optional(),
  status: z.enum(VERIFICATION_STATUSES).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  available: z.coerce.boolean().optional(),
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

const applicationBody = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(40),
  city: z.string().trim().min(2).max(80),
  experienceYears: z.coerce.number().int().min(1).max(60),
  services: z.preprocess((value) => typeof value === "string" ? JSON.parse(value) : value, z.array(z.string().min(2).max(80)).min(1).max(20)),
  bio: z.string().trim().min(20).max(2000),
});

const documentMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
const photoMimeTypes = ["image/jpeg", "image/png", "image/webp"];

/** Public technician application; a password is never supplied or exposed here. */
technicianRouter.post(
  "/apply",
  applicationUpload.fields([{ name: "photo", maxCount: 1 }, { name: "idDocument", maxCount: 1 }, { name: "degreeCertificate", maxCount: 1 }]),
  catchAsync(async (req, res) => {
    const input = applicationBody.parse(req.body);
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const photo = files?.photo?.[0];
    const idDocument = files?.idDocument?.[0];
    const degreeCertificate = files?.degreeCertificate?.[0];
    if (!photo || !idDocument || !degreeCertificate) throw ApiError.badRequest("A technician photo, government ID, and degree or trade certificate are required");
    if (!photoMimeTypes.includes(photo.mimetype)) throw ApiError.badRequest("Technician photo must be a JPG, PNG, or WEBP image");
    if (!documentMimeTypes.includes(idDocument.mimetype) || !documentMimeTypes.includes(degreeCertificate.mimetype)) throw ApiError.badRequest("ID and degree/certificate must be a JPG, PNG, or PDF");
    if (await User.exists({ email: input.email.toLowerCase() })) throw ApiError.conflict("An account with this email already exists");

    const user = await User.create({ name: input.name, email: input.email, phone: input.phone, city: input.city, role: "technician", password: crypto.randomBytes(32).toString("base64url") });
    const [avatar, idFile, certificateFile] = await Promise.all([
      FilesService.uploadFile(photo, "avatar", user.id),
      FilesService.uploadFile(idDocument, "id_document", user.id),
      FilesService.uploadFile(degreeCertificate, "certificate", user.id),
    ]);
    user.avatarUrl = avatar.url;
    await user.save();
    const technician = await Technician.create({ city: input.city, services: input.services, experienceYears: input.experienceYears, bio: input.bio, verificationStatus: "pending", user: user._id, documents: [{ kind: "id_card", url: idFile.url, verified: false }, { kind: "certificate", url: certificateFile.url, verified: false }] });
    await notifyAdmins({ title: "New technician application", body: `${user.name} submitted documents for verification.`, category: "technician", link: `/admin/verification/${technician.id}` });
    return sendSuccess(res, { applicationId: technician._id, status: technician.verificationStatus }, "Application submitted", 201);
  }),
);

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
    const { page, limit, city, service, q, minRating, available } = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = { verificationStatus: "approved" };
    if (city) filter.city = city;
    if (service) filter.services = service;
    if (minRating !== undefined) filter.rating = { $gte: minRating };
    if (available !== undefined) filter.isAvailable = available;
    if (q) {
      const matchingUsers = await User.find({ name: { $regex: q, $options: "i" } }).select("_id").lean();
      filter.$or = [
        { user: { $in: matchingUsers.map((user) => user._id) } },
        { services: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];
    }

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

/** Full technician roster for internal administration, including unapproved profiles. */
technicianRouter.get(
  "/admin/list",
  authenticate,
  isAdmin,
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const { page, limit, city, service, status, q, minRating, available } = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (city) filter.city = city;
    if (service) filter.services = service;
    if (status) filter.verificationStatus = status;
    if (minRating !== undefined) filter.rating = { $gte: minRating };
    if (available !== undefined) filter.isAvailable = available;
    if (q) {
      const matchingUsers = await User.find({ name: { $regex: q, $options: "i" } }).select("_id").lean();
      filter.$or = [
        { user: { $in: matchingUsers.map((user) => user._id) } },
        { services: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Technician.find(filter)
        .populate("user", "name email phone city avatarUrl isActive createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Technician.countDocuments(filter),
    ]);
    return sendPaginated(res, items, { page, limit, total }, "Technicians");
  }),
);

/** Internal application detail, including documents, for an administrator. */
technicianRouter.get(
  "/admin/:id",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    const technician = await Technician.findById(req.params.id)
      .populate("user", "name email phone city avatarUrl isActive createdAt")
      .lean();
    if (!technician) throw ApiError.notFound("Technician not found");
    return sendSuccess(res, technician, "Technician");
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
    emitToRoom(`user:${updated.user.toString()}`, "verification:updated", { status: req.body.status });
    await notifyAdmins({ title: `Technician ${req.body.status.replace("_", " ")}`, body: `A technician application was marked ${req.body.status.replace("_", " ")}.`, category: "technician", link: `/admin/verification/${updated.id}` });
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
