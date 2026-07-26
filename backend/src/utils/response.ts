import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  meta: { page: number; limit: number; total: number },
  message = "OK",
) {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    meta: { ...meta, pages: Math.max(1, Math.ceil(meta.total / meta.limit)) },
  });
}
