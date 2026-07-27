import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { FileAsset, FILE_PURPOSES, type FilePurpose } from "../../models/file.model.js";
import { authenticate } from "../../middleware/auth.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { env } from "../../config/env.js";

export const fileRouter = Router();

/** Per-purpose server-side limits — avatars are capped far below certificates. */
const LIMITS: Record<FilePurpose, { maxBytes: number; mime: RegExp }> = {
  avatar: { maxBytes: 2 * 1024 * 1024, mime: /^image\/(png|jpe?g|webp)$/ },
  id_card: { maxBytes: 8 * 1024 * 1024, mime: /^(image\/(png|jpe?g|webp)|application\/pdf)$/ },
  certificate: { maxBytes: 8 * 1024 * 1024, mime: /^(image\/(png|jpe?g|webp)|application\/pdf)$/ },
  insurance: { maxBytes: 8 * 1024 * 1024, mime: /^(image\/(png|jpe?g|webp)|application\/pdf)$/ },
  booking_photo: { maxBytes: 5 * 1024 * 1024, mime: /^image\/(png|jpe?g|webp)$/ },
  review_photo: { maxBytes: 5 * 1024 * 1024, mime: /^image\/(png|jpe?g|webp)$/ },
  cms_banner: { maxBytes: 5 * 1024 * 1024, mime: /^image\/(png|jpe?g|webp|svg\+xml)$/ },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

const purposeSchema = z.enum(FILE_PURPOSES);

/**
 * @openapi
 * /files:
 *   post:
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     summary: Upload a file (multipart) — the only upload path in the platform
 *     responses:
 *       201: { description: Stored file metadata }
 *       400: { description: Invalid purpose, mime type or size }
 */
fileRouter.post(
  "/",
  authenticate,
  upload.single("file"),
  catchAsync(async (req, res) => {
    const parsed = purposeSchema.safeParse(req.body?.purpose);
    if (!parsed.success) throw ApiError.badRequest("A valid `purpose` field is required");
    if (!req.file) throw ApiError.badRequest("No file uploaded under field `file`");

    const rules = LIMITS[parsed.data];
    if (!rules.mime.test(req.file.mimetype)) {
      throw ApiError.badRequest(`Unsupported file type for purpose "${parsed.data}"`);
    }
    if (req.file.size > rules.maxBytes) {
      throw ApiError.badRequest(`File exceeds the ${Math.round(rules.maxBytes / 1024 / 1024)}MB limit`);
    }

    const ext = path.extname(req.file.originalname).slice(0, 10).replace(/[^.\w]/g, "");
    const key = `${parsed.data}/${crypto.randomUUID()}${ext}`;
    const target = path.join(env.UPLOAD_DIR, key);

    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, req.file.buffer);

    const asset = await FileAsset.create({
      key,
      url: `${env.PUBLIC_FILE_BASE_URL}/${key}`,
      purpose: parsed.data,
      originalName: req.file.originalname.slice(0, 260),
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user!.id,
    });

    return sendSuccess(
      res,
      { fileId: asset._id, url: asset.url, mimeType: asset.mimeType, size: asset.size },
      "File uploaded",
      201,
    );
  }),
);

/**
 * @openapi
 * /files/{id}:
 *   get:
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     summary: File metadata
 *     responses:
 *       200: { description: File metadata }
 *       404: { description: Not found }
 */
fileRouter.get(
  "/:id",
  authenticate,
  catchAsync(async (req, res) => {
    const asset = await FileAsset.findById(req.params.id).lean();
    if (!asset) throw ApiError.notFound("File not found");
    return sendSuccess(res, asset, "File");
  }),
);
