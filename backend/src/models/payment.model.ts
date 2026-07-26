import mongoose, { Schema, type Document, type Model } from "mongoose";

export const PAYMENT_STATUSES = ["paid", "pending", "refunded", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  method: string;
  amount: number;
  commission: number;
  tax: number;
  status: PaymentStatus;
  date: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    method: { type: String, required: true, default: "Visa •••• 4242" },
    amount: { type: Number, required: true, min: 0 },
    commission: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending", index: true },
    date: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", paymentSchema);
