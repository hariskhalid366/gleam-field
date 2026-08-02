import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUserNotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sentBy: mongoose.Types.ObjectId;
  title: string;
  body: string;
  read: boolean;
}

const schema = new Schema<IUserNotification>({
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 180 },
  body: { type: String, required: true, maxlength: 1000 },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const UserNotification: Model<IUserNotification> = mongoose.models.UserNotification ?? mongoose.model<IUserNotification>("UserNotification", schema);
