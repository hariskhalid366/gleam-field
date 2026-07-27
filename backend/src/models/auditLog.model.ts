import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAuditLog extends Document {
  actor?: mongoose.Types.ObjectId;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorEmail: { type: String, trim: true },
    action: { type: String, required: true, index: true, maxlength: 80 },
    targetType: { type: String, required: true, maxlength: 60 },
    targetId: { type: String, maxlength: 60 },
    meta: { type: Schema.Types.Mixed },
    ip: { type: String, maxlength: 64 },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
