import mongoose, { Schema, type Document, type Model } from "mongoose";

export const NOTIFICATION_CATEGORIES = ["booking", "contact", "technician", "payment", "system"] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface IAdminNotification extends Document {
  title: string;
  body: string;
  category: NotificationCategory;
  read: boolean;
  link?: string;
}

const schema = new Schema<IAdminNotification>({
  title: { type: String, required: true, maxlength: 180 },
  body: { type: String, required: true, maxlength: 1000 },
  category: { type: String, enum: NOTIFICATION_CATEGORIES, required: true, index: true },
  read: { type: Boolean, default: false, index: true },
  link: { type: String, maxlength: 300 },
}, { timestamps: true });

export const AdminNotification: Model<IAdminNotification> = mongoose.models.AdminNotification ?? mongoose.model<IAdminNotification>("AdminNotification", schema);
