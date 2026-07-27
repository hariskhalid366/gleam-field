import { Router } from "express";
import { z } from "zod";
import { Setting } from "../../models/setting.model.js";
import { authenticate, isAdmin, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import * as auditService from "../audit/audit.service.js";

export const settingsRouter = Router();

const SCOPES = ["business", "payments", "security", "integrations", "roles"] as const;

/** Keys whose values are secrets: stored, but never echoed back on a GET. */
const SENSITIVE = /(secret|token|key|password)$/i;

function redact(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, SENSITIVE.test(k) && v ? "••••••••" : v]),
  );
}

/**
 * @openapi
 * /admin/settings:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: All platform settings scopes (secrets redacted)
 *     responses:
 *       200: { description: Settings screen payload }
 */
settingsRouter.get(
  "/",
  authenticate,
  isAdmin,
  catchAsync(async (_req, res) => {
    const docs = await Setting.find().lean();
    const scopes = Object.fromEntries(
      SCOPES.map((scope) => {
        const found = docs.find((d) => d.scope === scope);
        return [scope, redact((found?.values ?? {}) as Record<string, unknown>)];
      }),
    );
    return sendSuccess(res, { scopes }, "Settings");
  }),
);

/**
 * @openapi
 * /admin/settings/{scope}:
 *   patch:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update one settings scope (super_admin only)
 *     responses:
 *       200: { description: Settings updated }
 */
settingsRouter.patch(
  "/:scope",
  authenticate,
  authorize("super_admin"),
  validate({
    params: z.object({ scope: z.enum(SCOPES) }),
    body: z.object({ values: z.record(z.unknown()) }),
  }),
  catchAsync(async (req, res) => {
    const existing = await Setting.findOne({ scope: req.params.scope }).lean();
    const merged = { ...(existing?.values ?? {}), ...req.body.values };

    const saved = await Setting.findOneAndUpdate(
      { scope: req.params.scope },
      { scope: req.params.scope, values: merged, updatedBy: req.user!.id },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await auditService.record({
      actor: req.user!.id,
      actorEmail: req.user!.email,
      action: "settings.updated",
      targetType: "Setting",
      targetId: req.params.scope,
      // Only the touched keys are logged — never their values.
      meta: { keys: Object.keys(req.body.values) },
      ip: req.ip,
    });

    return sendSuccess(res, { scope: saved.scope, values: redact(saved.values as Record<string, unknown>) }, "Settings updated");
  }),
);
