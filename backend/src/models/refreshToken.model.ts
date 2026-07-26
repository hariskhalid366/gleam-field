import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Refresh tokens are persisted **hashed** so a database leak cannot be replayed.
 * Rotation: every refresh marks the used token as revoked and links its successor.
 */
export interface IRefreshToken extends Document {
  user: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByHash?: string;
  userAgent?: string;
  ip?: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByHash: { type: String },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true },
);

// TTL index — expired sessions are reaped by MongoDB itself.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken ?? mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
