import type { NextFunction, Request, Response } from "express";
import { User, type UserRole } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/token.js";
import { catchAsync } from "../utils/catchAsync.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole; email: string };
    }
  }
}

/** Requires a valid access token and an active user record. */
export const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw ApiError.unauthorized("Missing bearer token");

  const payload = verifyAccessToken(header.slice(7));
  const user = await User.findById(payload.sub).select("email role isActive");
  if (!user || !user.isActive) throw ApiError.unauthorized("Account is inactive or no longer exists");

  req.user = { id: user._id.toString(), role: user.role, email: user.email };
  next();
});

/** Role gate — always applied after `authenticate`. */
export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden("Insufficient role permissions"));
    next();
  };

export const isAdmin = authorize("admin", "super_admin");
