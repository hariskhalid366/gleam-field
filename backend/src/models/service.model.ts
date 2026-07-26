import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IService extends Document {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  emergencyPrice: number;
  estimatedDuration: string;
  icon?: string;
  isActive: boolean;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, maxlength: 2000 },
    basePrice: { type: Number, required: true, min: 0 },
    emergencyPrice: { type: Number, required: true, min: 0 },
    estimatedDuration: { type: String, default: "1–2 hrs" },
    icon: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Service: Model<IService> =
  mongoose.models.Service ?? mongoose.model<IService>("Service", serviceSchema);
