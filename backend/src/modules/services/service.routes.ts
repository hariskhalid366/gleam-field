import { Router } from "express";
import { z } from "zod";
import { Service } from "../../models/service.model.js";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { idParamSchema } from "../common/query.validation.js";

export const serviceRouter = Router();

const serviceBody = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  basePrice: z.number().min(0),
  emergencyPrice: z.number().min(0),
  estimatedDuration: z.string().max(60).optional(),
  icon: z.string().max(200).optional(),
  isActive: z.boolean().default(true),
});

/**
 * @openapi
 * /services:
 *   get:
 *     tags: [Services]
 *     security: []
 *     summary: Public service catalog
 *     responses:
 *       200: { description: List of active services }
 */
serviceRouter.get(
  "/",
  catchAsync(async (_req, res) => {
    const services = await Service.find({ isActive: true }).sort({ name: 1 }).lean();
    return sendSuccess(res, services, "Services");
  }),
);

/**
 * @openapi
 * /services/{id}:
 *   get:
 *     tags: [Services]
 *     security: []
 *     summary: Service detail
 *     responses:
 *       200: { description: Service }
 *       404: { description: Not found }
 */
serviceRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    const service = await Service.findById(req.params.id).lean();
    if (!service) throw ApiError.notFound("Service not found");
    return sendSuccess(res, service, "Service");
  }),
);

/**
 * @openapi
 * /services:
 *   post:
 *     tags: [Services]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create a service (admin only)
 *     responses:
 *       201: { description: Created }
 *       403: { description: Forbidden }
 */
serviceRouter.post(
  "/",
  authenticate,
  isAdmin,
  validate({ body: serviceBody }),
  catchAsync(async (req, res) => sendSuccess(res, await Service.create(req.body), "Service created", 201)),
);

/**
 * @openapi
 * /services/{id}:
 *   patch:
 *     tags: [Services]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update a service (admin only)
 *     responses:
 *       200: { description: Updated }
 */
serviceRouter.patch(
  "/:id",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema, body: serviceBody.partial() }),
  catchAsync(async (req, res) => {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) throw ApiError.notFound("Service not found");
    return sendSuccess(res, updated, "Service updated");
  }),
);

/**
 * @openapi
 * /services/{id}:
 *   delete:
 *     tags: [Services]
 *     security: [{ bearerAuth: [] }]
 *     summary: Deactivate a service (admin only)
 *     responses:
 *       200: { description: Deactivated }
 */
serviceRouter.delete(
  "/:id",
  authenticate,
  isAdmin,
  validate({ params: idParamSchema }),
  catchAsync(async (req, res) => {
    const updated = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!updated) throw ApiError.notFound("Service not found");
    return sendSuccess(res, updated, "Service deactivated");
  }),
);
