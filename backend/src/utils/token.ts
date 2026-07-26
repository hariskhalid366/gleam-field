import crypto from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";
import type { UserRole } from "../models/user.model.js";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
  type: "access";
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
  version: number;
  type: "refresh";
}

export function signAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ sub: userId, role, type: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: "servicepro-api",
    audience: "servicepro-app",
  } as SignOptions);
}

export function signRefreshToken(userId: string, version: number): { token: string; jti: string } {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: userId, jti, version, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: "servicepro-api",
    audience: "servicepro-app",
  } as SignOptions);
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: "servicepro-api",
      audience: "servicepro-app",
    }) as AccessTokenPayload;
    if (payload.type !== "access") throw new Error("wrong token type");
    return payload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: "servicepro-api",
      audience: "servicepro-app",
    }) as RefreshTokenPayload;
    if (payload.type !== "refresh") throw new Error("wrong token type");
    return payload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
}

/** Refresh tokens are stored as SHA-256 digests, never in plaintext. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict" as const,
    path: `${env.API_PREFIX}/auth`,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}
