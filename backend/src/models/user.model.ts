import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const USER_ROLES = ["customer", "technician", "admin", "super_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  city?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  tokenVersion: number;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    // select:false keeps the hash out of every ordinary query result.
    password: { type: String, required: true, select: false, minlength: 8 },
    role: { type: String, enum: USER_ROLES, default: "customer", index: true },
    city: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    // Bumping tokenVersion invalidates every issued refresh token for the user.
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.__v;
        delete ret.tokenVersion;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
