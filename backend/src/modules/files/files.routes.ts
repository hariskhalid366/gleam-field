import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.js";
import { ApiError } from "../../utils/ApiError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { FilesController } from "./files.controller.js";
import { VALIDATION_RULES, type UploadPurpose, PURPOSES } from "./files.service.js";

export const filesRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/** Reusable middleware generator for inline file uploads in other routes */
export function uploadMiddleware(purpose: UploadPurpose) {
  const rules = VALIDATION_RULES[purpose];

  return [
    upload.single("file"),
    (req: Request, _res: Response, next: NextFunction) => {
      const file = req.file;
      if (!file) {
        return next(ApiError.badRequest("No file uploaded"));
      }

      // 1. Validate MIME Type
      if (!rules.allowedMimeTypes.includes(file.mimetype)) {
        return next(
          ApiError.badRequest(
            `Invalid file type for purpose "${purpose}". Allowed: ${rules.allowedMimeTypes.join(", ")}`,
          ),
        );
      }

      // 2. Validate Size
      if (file.size > rules.maxSize) {
        const sizeMb = (rules.maxSize / (1024 * 1024)).toFixed(0);
        return next(
          ApiError.badRequest(
            `File size exceeds maximum limit of ${sizeMb}MB for purpose "${purpose}".`,
          ),
        );
      }

      next();
    },
  ];
}

/**
 * @openapi
 * /files:
 *   post:
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     summary: Centralized file upload with size/mime validation per purpose
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: The file binary to upload
 *       - in: query
 *         name: purpose
 *         type: string
 *         required: true
 *         enum: [avatar, document, certificate, id_document, selfie, booking_photo, review_image, cms_banner]
 *         description: Purpose of the uploaded file
 *     responses:
 *       201: { description: Uploaded file details }
 */
filesRouter.post(
  "/",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    // First, grab purpose to apply the appropriate validation dynamic rules
    const purpose = (req.query.purpose || req.body.purpose) as UploadPurpose;
    if (!purpose || !PURPOSES.includes(purpose)) {
      return next(ApiError.badRequest(`Invalid or missing upload purpose. Must be one of: ${PURPOSES.join(", ")}`));
    }

    // Handover to dynamic multer and validation middleware
    const handlers = uploadMiddleware(purpose);

    let currentIdx = 0;
    const runNext = (err?: any) => {
      if (err) return next(err);
      if (currentIdx < handlers.length) {
        const handler = handlers[currentIdx++];
        if (handler) {
          handler(req, res, runNext);
        }
      } else {
        next();
      }
    };
    runNext();
  },
  catchAsync(FilesController.upload),
);

/**
 * @openapi
 * /files/{id}:
 *   get:
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     summary: Fetch uploaded file details (owner or admin only)
 *     responses:
 *       200: { description: File record }
 */
filesRouter.get("/:id", authenticate, catchAsync(FilesController.getFile));

/**
 * @openapi
 * /files/{id}:
 *   delete:
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     summary: Delete an uploaded file (admin only)
 *     responses:
 *       200: { description: File deleted }
 */
filesRouter.delete("/:id", authenticate, catchAsync(FilesController.deleteFile));
