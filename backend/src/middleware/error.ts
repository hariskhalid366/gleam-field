import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    statusCode = 409;
    message = "Duplicate value violates a unique constraint";
  }

  const logMeta = { method: req.method, url: req.originalUrl, statusCode, userId: req.user?.id };
  if (statusCode >= 500) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    logger.error(errorObj.message, { ...logMeta, error: errorObj });
  } else {
    logger.warn(message, logMeta);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    // Stack traces are never leaked in production responses.
    ...(!env.isProd && err instanceof Error ? { stack: err.stack } : {}),
  });
}
