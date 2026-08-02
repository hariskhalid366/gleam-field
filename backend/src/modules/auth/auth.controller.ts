import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { refreshCookieOptions } from "../../utils/token.js";
import * as authService from "./auth.service.js";

const meta = (req: Request) => ({ userAgent: req.get("user-agent") ?? undefined, ip: req.ip });

/** The refresh token is preferred from the httpOnly cookie; body is the fallback for native clients. */
const readRefreshToken = (req: Request): string | undefined =>
  (req.cookies?.refreshToken as string | undefined) ?? (req.body?.refreshToken as string | undefined);

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body, meta(req));
  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
  return sendSuccess(res, result, "Account created", 201);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, meta(req));
  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
  return sendSuccess(res, result, "Signed in");
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = readRefreshToken(req);
  if (!token) throw ApiError.unauthorized("Refresh token is required");
  const result = await authService.refresh(token, meta(req));
  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
  return sendSuccess(res, result, "Session refreshed");
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(readRefreshToken(req));
  res.clearCookie("refreshToken", refreshCookieOptions());
  return sendSuccess(res, null, "Signed out");
});

export const logoutAll = catchAsync(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.id);
  res.clearCookie("refreshToken", refreshCookieOptions());
  return sendSuccess(res, null, "All sessions revoked");
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  return sendSuccess(res, null, "Password updated — please sign in again");
});

export const me = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await authService.me(req.user!.id), "Current user");
});
export const updateProfile = catchAsync(async (req: Request, res: Response) => sendSuccess(res, await authService.updateProfile(req.user!.id, req.body), "Profile updated"));
export const sessions = catchAsync(async (req: Request, res: Response) => sendSuccess(res, await authService.sessions(req.user!.id), "Active sessions"));
export const revokeSession = catchAsync(async (req: Request, res: Response) => { await authService.revokeSession(req.user!.id, req.params.id!); return sendSuccess(res, null, "Session revoked"); });
