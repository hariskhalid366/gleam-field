import { Router } from "express";
import { z } from "zod";
import { CmsBlock } from "../../models/cmsBlock.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import * as auditService from "../audit/audit.service.js";

export const cmsRouter = Router();

/**
 * @openapi
 * /cms:
 *   get:
 *     tags: [CMS]
 *     security: []
 *     summary: Published marketing content blocks (public)
 *     responses:
 *       200: { description: Content blocks keyed by block key }
 */
cmsRouter.get(
  "/",
  validate({ query: z.object({ page: z.string().max(60).optional() }) }),
  catchAsync(async (req, res) => {
    const filter = { isPublished: true, ...(req.query.page ? { page: req.query.page } : {}) };
    const blocks = await CmsBlock.find(filter).sort({ page: 1, key: 1 }).lean();
    return sendSuccess(res, blocks, "Content blocks");
  }),
);

const blockBody = z.object({
  page: z.string().min(1).max(60),
  title: z.string().min(2).max(160),
  content: z.record(z.unknown()).default({}),
  isPublished: z.boolean().default(true),
});

/**
 * @openapi
 * /cms/{key}:
 *   put:
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create or update a content block (admin only)
 *     responses:
 *       200: { description: Block saved }
 */
cmsRouter.put(
  "/:key",
  authenticate,
  isAdmin,
  validate({
    params: z.object({ key: z.string().min(2).max(80).regex(/^[a-z0-9_.-]+$/) }),
    body: blockBody,
  }),
  catchAsync(async (req, res) => {
    const saved = await CmsBlock.findOneAndUpdate(
      { key: req.params.key },
      { ...req.body, key: req.params.key, updatedBy: req.user!.id },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    await auditService.record({
      actor: req.user!.id,
      actorEmail: req.user!.email,
      action: "cms.block.updated",
      targetType: "CmsBlock",
      targetId: req.params.key,
      ip: req.ip,
    });
    return sendSuccess(res, saved, "Content block saved");
  }),
);

/**
 * @openapi
 * /cms/{key}:
 *   delete:
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     summary: Unpublish a content block (admin only)
 *     responses:
 *       200: { description: Unpublished }
 */
cmsRouter.delete(
  "/:key",
  authenticate,
  isAdmin,
  validate({ params: z.object({ key: z.string().min(2).max(80) }) }),
  catchAsync(async (req, res) => {
    const updated = await CmsBlock.findOneAndUpdate({ key: req.params.key }, { isPublished: false }, { new: true });
    if (!updated) throw ApiError.notFound("Content block not found");
    return sendSuccess(res, updated, "Content block unpublished");
  }),
);
