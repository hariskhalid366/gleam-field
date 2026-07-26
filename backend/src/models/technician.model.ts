import mongoose, { Schema, type Document, type Model } from "mongoose";

export const VERIFICATION_STATUSES = ["pending", "under_review", "approved", "rejected", "suspended"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export interface ITechnician extends Document {
  user: mongoose.Types.ObjectId;
  bio?: string;
  city: string;
  services: string[];
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  jobsCompleted: number;
  verificationStatus: VerificationStatus;
  documents: {
    kind: "id_card" | "certificate" | "insurance" | "background_check";
    url: string;
    uploadedAt: Date;
    verified: boolean;
  }[];
  reviewNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  isAvailable: boolean;
}

const technicianSchema = new Schema<ITechnician>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    bio: { type: String, maxlength: 2000 },
    city: { type: String, required: true, index: true },
    services: [{ type: String, index: true }],
    experienceYears: { type: Number, default: 0, min: 0, max: 60 },
    hourlyRate: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    jobsCompleted: { type: Number, default: 0, min: 0 },
    verificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: "pending", index: true },
    documents: [
      {
        kind: { type: String, enum: ["id_card", "certificate", "insurance", "background_check"], required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
      },
    ],
    reviewNotes: { type: String, maxlength: 2000 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Technician: Model<ITechnician> =
  mongoose.models.Technician ?? mongoose.model<ITechnician>("Technician", technicianSchema);
