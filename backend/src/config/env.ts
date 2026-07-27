import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Fail fast: the process refuses to boot with an invalid/incomplete environment
 * instead of blowing up at the first request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().startsWith("/").default("/api/v1"),
  CORS_ORIGINS: z.string().default("http://localhost:8080"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  // File storage (local disk by default; point PUBLIC_FILE_BASE_URL at a CDN/S3 origin in prod)
  UPLOAD_DIR: z.string().default("uploads"),
  PUBLIC_FILE_BASE_URL: z.string().default("http://localhost:4000/uploads"),
});


const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
};

export type Env = typeof env;
