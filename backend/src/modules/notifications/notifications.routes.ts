import { Router } from "express";
import { z } from "zod";
import { AdminNotification } from "../../models/adminNotification.model.js";
import { UserNotification } from "../../models/userNotification.model.js";
import { Technician } from "../../models/technician.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated, sendSuccess } from "../../utils/response.js";
import { idParamSchema, paginationSchema } from "../common/query.validation.js";
import { emitToRoom } from "../../sockets/index.js";

export const notificationsRouter = Router();
notificationsRouter.get("/", authenticate, isAdmin, validate({ query: paginationSchema.extend({ read: z.coerce.boolean().optional() }) }), catchAsync(async (req, res) => {
  const { page, limit, read } = req.query as unknown as { page: number; limit: number; read?: boolean };
  const filter = read === undefined ? {} : { read };
  const [items, total] = await Promise.all([AdminNotification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), AdminNotification.countDocuments(filter)]);
  return sendPaginated(res, items, { page, limit, total }, "Admin notifications");
}));
notificationsRouter.patch("/read-all", authenticate, isAdmin, catchAsync(async (_req, res) => { await AdminNotification.updateMany({ read: false }, { read: true }); return sendSuccess(res, null, "All notifications marked read"); }));
notificationsRouter.patch("/:id/read", authenticate, isAdmin, validate({ params: idParamSchema, body: z.object({ read: z.boolean() }) }), catchAsync(async (req, res) => { const item = await AdminNotification.findByIdAndUpdate(req.params.id, { read: req.body.read }, { new: true }); return sendSuccess(res, item, "Notification updated"); }));

/** Broadcast an operational message to all approved technicians or selected technician profiles. */
notificationsRouter.post("/technicians", authenticate, isAdmin, validate({ body: z.object({ title: z.string().trim().min(2).max(180), body: z.string().trim().min(2).max(1000), technicianIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(100).optional() }) }), catchAsync(async (req, res) => {
  const selected = req.body.technicianIds?.length ? { _id: { $in: req.body.technicianIds }, verificationStatus: "approved" } : { verificationStatus: "approved" };
  const technicians = await Technician.find(selected).select("user").lean();
  if (!technicians.length) return sendSuccess(res, { delivered: 0 }, "No approved technicians matched");
  const entries = technicians.map((technician) => ({ recipient: technician.user, sentBy: req.user!.id, title: req.body.title, body: req.body.body }));
  const created = await UserNotification.insertMany(entries);
  created.forEach((item) => emitToRoom(`user:${item.recipient.toString()}`, "technician:notification", item.toJSON()));
  return sendSuccess(res, { delivered: created.length }, "Notification sent to technicians", 201);
}));

/** Technician's persistent inbox, usable by the technician application. */
notificationsRouter.get("/me", authenticate, catchAsync(async (req, res) => {
  const items = await UserNotification.find({ recipient: req.user!.id }).sort({ createdAt: -1 }).limit(100).lean();
  return sendSuccess(res, items, "Notifications");
}));
