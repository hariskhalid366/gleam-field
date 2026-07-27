import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IFile extends Document {
  fileId: string;
  url: string;
  mimeType: string;
  size: number;
  purpose: string;
  owner: mongoose.Types.ObjectId;
}

const fileSchema = new Schema<IFile>(
  {
    fileId: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    purpose: { type: String, required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

export const FileModel: Model<IFile> =
  mongoose.models.File ?? mongoose.model<IFile>("File", fileSchema);
