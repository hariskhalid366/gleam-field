import mongoose, { Schema, type Document, type Model } from "mongoose";

export const NOTIFICATION_CHANNELS = ["in_app", "email", "sms", "push"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_TYPES = [
  "booking",
  "verification",
  "payment",
  "support",
  "system",
  "broadcast",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  user?: mongoose.Types.ObjectId;
  audience?: "all" | "customers" | "technicians" | "admins";
  type: NotificationType;
  title: string;
  body: string;
  channels: NotificationChannel[];
  data?: Record<string, unknown>;
  readAt?: Date;
  deliveries: { channel: NotificationChannel; status: "queued" | "sent" | "failed"; at: Date; error?: string }[];
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    audience: { type: String, enum: ["all", "customers", "technicians", "admins"] },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true, index: true },
    title: { type: String, required: true, maxlength: 160 },
    body: { type: String, required: true, maxlength: 2000 },
    channels: [{ type: String, enum: NOTIFICATION_CHANNELS }],
    data: { type: Schema.Types.Mixed },
    readAt: { type: Date },
    deliveries: [
      {
        channel: { type: String, enum: NOTIFICATION_CHANNELS, required: true },
        status: { type: String, enum: ["queued", "sent", "failed"], default: "queued" },
        at: { type: Date, default: Date.now },
        error: { type: String, maxlength: 500 },
      },
    ],
  },
  { timestamps: true },
);

notificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ?? mongoose.model<INotification>("Notification", notificationSchema);

export interface INotificationTemplate extends Document {
  key: string;
  name: string;
  subject: string;
  body: string;
  channels: NotificationChannel[];
  isActive: boolean;
}

const templateSchema = new Schema<INotificationTemplate>(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    name: { type: String, required: true, maxlength: 120 },
    subject: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 4000 },
    channels: [{ type: String, enum: NOTIFICATION_CHANNELS }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const NotificationTemplate: Model<INotificationTemplate> =
  mongoose.models.NotificationTemplate ??
  mongoose.model<INotificationTemplate>("NotificationTemplate", templateSchema);
