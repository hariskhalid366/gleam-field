import type { Request, Response } from "express";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";
import { logger } from "../src/config/logger.js";

const app = createApp();
let connectionAttempt: Promise<void> | undefined;

function ensureDatabaseConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();

  connectionAttempt ??= connectDatabase().finally(() => {
    connectionAttempt = undefined;
  });

  return connectionAttempt;
}

/**
 * Vercel serverless entry point. Do not import src/server.ts here: it calls
 * listen() and initialises Socket.IO, neither of which belongs in a function.
 */
export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await ensureDatabaseConnection();
    app(req, res);
  } catch (error) {
    logger.error("Database connection failed in Vercel function", { error });
    res.status(503).json({ success: false, message: "Database temporarily unavailable" });
  }
}
