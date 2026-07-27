import mongoose, { Schema, type Document, type Model } from "mongoose";

export const FILE_PURPOSES = [
  "avatar",
  "id_card",
  "certificate",
  "insurance",
  "booking_photo",
  "review_photo",
  "cms_banner",
] as const;
export type FilePurpose = (typeof FILE_PURPOSES)[number];

export interface IFile extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  url: string;
  purpose: FilePurpose;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
}

const fileSchema = new Schema<IFile>(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    purpose: { type: String, enum: FILE_PURPOSES, required: true, index: true },
    originalName: { type: String, required: true, maxlength: 260 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

export const FileAsset: Model<IFile> =
  mongoose.models.FileAsset ?? mongoose.model<IFile>("FileAsset", fileSchema);
