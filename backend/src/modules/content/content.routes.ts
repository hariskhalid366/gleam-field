import { Router } from "express";
import { z } from "zod";
import { Content } from "../../models/content.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";

export const contentRouter = Router();

const keySchema = z.object({ key: z.string().min(1).max(160).regex(/^[a-z0-9._-]+$/) });
const contentBody = z.object({
  scope: z.enum(["public", "admin", "system"]).default("public"),
  data: z.unknown(),
});

// Only public content is exposed anonymously. Admin and system content needs an admin session.
contentRouter.get(
  "/:key",
  validate({ params: keySchema }),
  catchAsync(async (req, res) => {
    const content = await Content.findOne({ key: req.params.key, scope: "public" }).lean();
    if (!content) throw ApiError.notFound("Content not found");
    return sendSuccess(res, content, "Content");
  }),
);

contentRouter.get(
  "/admin/:key",
  authenticate,
  isAdmin,
  validate({ params: keySchema }),
  catchAsync(async (req, res) => {
    const content = await Content.findOne({ key: req.params.key }).lean();
    if (!content) throw ApiError.notFound("Content not found");
    return sendSuccess(res, content, "Content");
  }),
);

contentRouter.put(
  "/admin/:key",
  authenticate,
  isAdmin,
  validate({ params: keySchema, body: contentBody }),
  catchAsync(async (req, res) => {
    const content = await Content.findOneAndUpdate(
      { key: req.params.key },
      req.body,
      { new: true, upsert: true, runValidators: true },
    );
    return sendSuccess(res, content, "Content saved");
  }),
);
