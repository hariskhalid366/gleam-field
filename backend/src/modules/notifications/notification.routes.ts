import { Router } from "express";
import { z } from "zod";
import { Notification, NotificationTemplate, NOTIFICATION_CHANNELS } from "../../models/notification.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema, paginationSchema } from "../common/query.validation.js";
import * as notificationService from "./notification.service.js";
import * as auditService from "../audit/audit.service.js";

export const notificationRouter = Router();

const listQuery = paginationSchema.extend({
  unreadOnly: z.coerce.boolean().default(false),
});

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     summary: Screen payload — recent activity, unread count and templates
 *     responses:
 *       200: { description: Notification centre }
 */
notificationRouter.get(
  "/",
  authenticate,
  validate({ query: listQuery }),
  catchAsync(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const admin = req.user!.role === "admin" || req.user!.role === "super_admin";
    const scope = admin ? {} : { user: req.user!.id };
    const filter = { ...scope, ...(q.unreadOnly ? { readAt: { $exists: false } } : {}) };

    const [items, total, unread, templates] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...scope, readAt: { $exists: false } }),
      admin ? NotificationTemplate.find().sort({ name: 1 }).lean() : Promise.resolve([]),
    ]);

    return sendSuccess(
      res,
      {
        items,
        templates,
        counts: { total, unread },
        meta: { page: q.page, limit: q.limit, total, pages: Math.max(1, Math.ceil(total / q.limit)) },
      },
      "Notifications",
    );
  }),
);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     summary: Mark a notification as read
 *     responses:
 *       200: { description: Marked read }
 */
notificationRouter.patch(
  "/:id/read",
  authenticate,
  validate({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    const admin = req.user!.role === "admin" || req.user!.role === "super_admin";
    const filter = admin ? { _id: req.params.id } : { _id: req.params.id, user: req.user!.id };
    const updated = await Notification.findOneAndUpdate(filter, { readAt: new Date() }, { new: true });
    if (!updated) throw ApiError.notFound("Notification not found");
    return sendSuccess(res, updated, "Notification marked read");
  }),
);

const broadcastBody = z.object({
  audience: z.enum(["all", "customers", "technicians", "admins"]),
  title: z.string().min(2).max(160),
  body: z.string().min(2).max(2000),
  channels: z.array(z.enum(NOTIFICATION_CHANNELS)).min(1).default(["in_app"]),
});

/**
 * @openapi
 * /notifications/broadcast:
 *   post:
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     summary: Broadcast a notification to an audience (admin only)
 *     responses:
 *       201: { description: Broadcast queued }
 */
notificationRouter.post(
  "/broadcast",
  authenticate,
  isAdmin,
  validate({ body: broadcastBody }),
  catchAsync(async (req, res) => {
    const result = await notificationService.broadcast(req.body);
    await auditService.record({
      actor: req.user!.id,
      actorEmail: req.user!.email,
      action: "notification.broadcast",
      targetType: "Notification",
      meta: { audience: req.body.audience, recipients: result.recipients },
      ip: req.ip,
    });
    return sendSuccess(res, result, "Broadcast queued", 201);
  }),
);

const templateBody = z.object({
  key: z.string().min(2).max(80).regex(/^[a-z0-9_.-]+$/),
  name: z.string().min(2).max(120),
  subject: z.string().min(2).max(200),
  body: z.string().min(2).max(4000),
  channels: z.array(z.enum(NOTIFICATION_CHANNELS)).min(1).default(["in_app"]),
  isActive: z.boolean().default(true),
});

/**
 * @openapi
 * /notifications/templates:
 *   post:
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create or replace a notification template (admin only)
 *     responses:
 *       200: { description: Template saved }
 */
notificationRouter.post(
  "/templates",
  authenticate,
  isAdmin,
  validate({ body: templateBody }),
  catchAsync(async (req, res) => {
    const saved = await NotificationTemplate.findOneAndUpdate({ key: req.body.key }, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    await auditService.record({
      actor: req.user!.id,
      actorEmail: req.user!.email,
      action: "notification.template.saved",
      targetType: "NotificationTemplate",
      targetId: req.body.key,
      ip: req.ip,
    });
    return sendSuccess(res, saved, "Template saved");
  }),
);
