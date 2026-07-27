import { Router } from "express";
import { z } from "zod";
import { authenticate, isAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendPaginated } from "../../utils/response.js";
import { paginationSchema, objectId } from "../common/query.validation.js";
import * as auditService from "./audit.service.js";

export const auditRouter = Router();

const auditQuery = paginationSchema.extend({
  action: z.string().max(80).optional(),
  actor: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Paginated audit trail of sensitive admin actions
 *     responses:
 *       200: { description: Audit log page }
 *       403: { description: Forbidden }
 */
auditRouter.get(
  "/",
  authenticate,
  isAdmin,
  validate({ query: auditQuery }),
  catchAsync(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof auditQuery>;
    const { items, total } = await auditService.list(q);
    return sendPaginated(res, items, { page: q.page, limit: q.limit, total }, "Audit logs");
  }),
);
