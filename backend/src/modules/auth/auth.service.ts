import { RefreshToken } from "../../models/refreshToken.model.js";
import { User, type IUser } from "../../models/user.model.js";
import { Technician } from "../../models/technician.model.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  hashToken, signAccessToken, signRefreshToken, verifyRefreshToken,
} from "../../utils/token.js";
import { logger } from "../../config/logger.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

type SessionMeta = { userAgent?: string; ip?: string };

async function issueTokens(user: IUser, meta: SessionMeta) {
  const accessToken = signAccessToken(user._id.toString(), user.role);
  const { token: refreshToken } = signRefreshToken(user._id.toString(), user.tokenVersion);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, meta: SessionMeta) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create(input);

  // Technicians start life in the verification queue.
  if (user.role === "technician") {
    await Technician.create({ user: user._id, city: input.city ?? "Unknown", services: [] });
  }

  const tokens = await issueTokens(user, meta);
  logger.info("User registered", { userId: user._id.toString(), role: user.role });
  return { user: user.toJSON(), ...tokens };
}

export async function login(input: LoginInput, meta: SessionMeta) {
  const user = await User.findOne({ email: input.email }).select("+password");
  // Same generic message for unknown email and wrong password — no user enumeration.
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  const ok = await user.comparePassword(input.password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = await issueTokens(user, meta);
  return { user: user.toJSON(), ...tokens };
}

/** Rotating refresh: the presented token is revoked and replaced on every call. */
export async function refresh(presentedToken: string, meta: SessionMeta) {
  const payload = verifyRefreshToken(presentedToken);
  const tokenHash = hashToken(presentedToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored) throw ApiError.unauthorized("Refresh token is not recognised");

  if (stored.revokedAt) {
    // Replay of a rotated token: treat the whole session family as compromised.
    await RefreshToken.updateMany({ user: stored.user, revokedAt: { $exists: false } }, { revokedAt: new Date() });
    await User.findByIdAndUpdate(stored.user, { $inc: { tokenVersion: 1 } });
    logger.warn("Refresh token reuse detected — all sessions revoked", { userId: String(stored.user) });
    throw ApiError.unauthorized("Refresh token has already been used");
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("Account is inactive");
  if (payload.version !== user.tokenVersion) throw ApiError.unauthorized("Session is no longer valid");

  const tokens = await issueTokens(user, meta);
  stored.revokedAt = new Date();
  stored.replacedByHash = hashToken(tokens.refreshToken);
  await stored.save();

  return { user: user.toJSON(), ...tokens };
}

export async function logout(presentedToken?: string) {
  if (!presentedToken) return;
  await RefreshToken.findOneAndUpdate({ tokenHash: hashToken(presentedToken) }, { revokedAt: new Date() });
}

/** Global sign-out: invalidates every refresh token for the user. */
export async function logoutAll(userId: string) {
  await RefreshToken.updateMany({ user: userId, revokedAt: { $exists: false } }, { revokedAt: new Date() });
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.unauthorized("Current password is incorrect");

  user.password = newPassword;
  await user.save();
  await logoutAll(userId);
}

export async function me(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  const technician = user.role === "technician" ? await Technician.findOne({ user: user._id }) : null;
  return { user: user.toJSON(), technician };
}
