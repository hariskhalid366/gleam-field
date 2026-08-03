import express, { type Express } from "express";
import path from "node:path";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";
import { env } from "./config/env.js";
import { httpLogStream } from "./config/logger.js";
import { mountSwagger } from "./config/swagger.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { apiRouter } from "./routes.js";
import { ApiError } from "./utils/ApiError.js";

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Security headers, strict CORS allowlist, payload limits.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, cb) =>
        !origin || env.corsOrigins.includes(origin) ? cb(null, true) : cb(ApiError.forbidden("Origin not allowed by CORS")),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(mongoSanitize()); // strips $ and . operators from user input
  app.use(hpp());
  app.use(compression());
  // Uploaded avatars and documents are stored under backend/public/uploads and referenced by relative URLs.
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads"), { fallthrough: false, maxAge: env.isProd ? "1d" : 0 }));
  app.use(morgan(env.isProd ? "combined" : "dev", { stream: httpLogStream }));
  app.use(globalLimiter);

  mountSwagger(app);
  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Export a ready-to-handle Express application for serverless adapters such as
// Vercel. The named factory remains available to the standalone HTTP server.
const app = createApp();
export default app;
