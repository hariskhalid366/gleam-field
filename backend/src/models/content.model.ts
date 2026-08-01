import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Flexible content records keep the editable/public site copy and the remaining
 * operational mock datasets in MongoDB without forcing a premature schema for
 * every CMS block, notification, or report widget.
 */
export interface IContent extends Document {
  key: string;
  scope: "public" | "admin" | "system";
  data: unknown;
}

const contentSchema = new Schema<IContent>(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    scope: { type: String, enum: ["public", "admin", "system"], required: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const Content: Model<IContent> =
  mongoose.models.Content ?? mongoose.model<IContent>("Content", contentSchema);
