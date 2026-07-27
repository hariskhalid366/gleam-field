import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICmsBlock extends Document {
  key: string;
  page: string;
  title: string;
  content: Record<string, unknown>;
  isPublished: boolean;
  updatedBy?: mongoose.Types.ObjectId;
}

const cmsBlockSchema = new Schema<ICmsBlock>(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    page: { type: String, required: true, index: true, maxlength: 60 },
    title: { type: String, required: true, maxlength: 160 },
    content: { type: Schema.Types.Mixed, default: {} },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const CmsBlock: Model<ICmsBlock> =
  mongoose.models.CmsBlock ?? mongoose.model<ICmsBlock>("CmsBlock", cmsBlockSchema);
