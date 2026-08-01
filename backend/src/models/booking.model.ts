import mongoose, { Schema, type Document, type Model } from "mongoose";

export const BOOKING_STATUSES = [
  "pending",
  "assigned",
  "accepted",
  "travelling",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface IBooking extends Document {
  reference: string;
  customer: mongoose.Types.ObjectId;
  technician?: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  status: BookingStatus;
  isEmergency: boolean;
  scheduledFor: Date;
  address: { line1: string; city: string; postalCode?: string; notes?: string };
  location?: { type: "Point"; coordinates: [number, number] };
  photos: { fileId: string; url: string }[];
  price: { base: number; surcharge: number; tax: number; total: number; currency: string };
  timeline: { status: BookingStatus; at: Date; by?: mongoose.Types.ObjectId; note?: string }[];
  cancellationReason?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    technician: { type: Schema.Types.ObjectId, ref: "Technician", index: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending", index: true },
    isEmergency: { type: Boolean, default: false },
    scheduledFor: { type: Date, required: true, index: true },
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      notes: { type: String, maxlength: 1000 },
    },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    photos: [
      {
        fileId: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    price: {
      base: { type: Number, required: true, min: 0 },
      surcharge: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "USD" },
    },
    timeline: [
      {
        status: { type: String, enum: BOOKING_STATUSES, required: true },
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "User" },
        note: { type: String, maxlength: 500 },
      },
    ],
    cancellationReason: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

bookingSchema.index({ location: "2dsphere" });
bookingSchema.index({ customer: 1, createdAt: -1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", bookingSchema);
