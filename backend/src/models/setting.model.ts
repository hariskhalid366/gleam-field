import mongoose, { Schema, type Document, type Model } from "mongoose";

/** Single-document store for platform-wide business configuration. */
export interface ISetting extends Document {
  scope: string;
  values: Record<string, unknown>;
  updatedBy?: mongoose.Types.ObjectId;
}

const settingSchema = new Schema<ISetting>(
  {
    scope: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 60 },
    values: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting ?? mongoose.model<ISetting>("Setting", settingSchema);
