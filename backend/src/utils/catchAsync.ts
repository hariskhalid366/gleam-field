import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Wraps async handlers so rejected promises reach the error middleware. */
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
