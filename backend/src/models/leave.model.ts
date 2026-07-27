import mongoose, { Schema, type Document, type Model } from "mongoose";

export const LEAVE_STATUSES = ["pending", "approved", "rejected"] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export interface ILeave extends Document {
  technician: mongoose.Types.ObjectId;
  from: Date;
  to: Date;
  reason?: string;
  status: LeaveStatus;
  decidedBy?: mongoose.Types.ObjectId;
}

const leaveSchema = new Schema<ILeave>(
  {
    technician: { type: Schema.Types.ObjectId, ref: "Technician", required: true, index: true },
    from: { type: Date, required: true, index: true },
    to: { type: Date, required: true, index: true },
    reason: { type: String, maxlength: 500 },
    status: { type: String, enum: LEAVE_STATUSES, default: "pending", index: true },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Leave: Model<ILeave> =
  mongoose.models.Leave ?? mongoose.model<ILeave>("Leave", leaveSchema);
