import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IReview extends Document {
  booking: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  technician: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  isHidden: boolean;
  isReported: boolean;
  moderatedBy?: mongoose.Types.ObjectId;
}

const reviewSchema = new Schema<IReview>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    technician: { type: Schema.Types.ObjectId, ref: "Technician", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 2000 },
    isHidden: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", reviewSchema);
