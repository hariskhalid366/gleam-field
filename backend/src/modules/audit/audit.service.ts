import type { FilterQuery } from "mongoose";
import { AuditLog, type IAuditLog } from "../../models/auditLog.model.js";
import { logger } from "../../config/logger.js";

export type AuditEntry = {
  actor?: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
};

/**
 * Fire-and-forget audit trail. Never throws into the caller's request flow —
 * a failed audit write must not fail the business action.
 */
export async function record(entry: AuditEntry) {
  try {
    await AuditLog.create(entry);
  } catch (err) {
    logger.error("Failed to write audit log", { action: entry.action, err });
  }
}

export async function list(params: {
  page: number;
  limit: number;
  action?: string;
  actor?: string;
  from?: Date;
  to?: Date;
}) {
  const filter: FilterQuery<IAuditLog> = {};
  if (params.action) filter.action = params.action;
  if (params.actor) filter.actor = params.actor;
  if (params.from || params.to) {
    filter.createdAt = {
      ...(params.from ? { $gte: params.from } : {}),
      ...(params.to ? { $lte: params.to } : {}),
    };
  }

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return { items, total };
}
