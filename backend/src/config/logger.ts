import winston from "winston";
import { env } from "./env.js";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} ${level}: ${stack ?? message}${extra}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: "servicepro-api", env: env.NODE_ENV },
  format: env.isProd ? prodFormat : devFormat,
  // Container platforms capture stdout/stderr. Avoid filesystem transports:
  // their ephemeral directories may be read-only and must never block startup.
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

/** morgan → winston bridge */
export const httpLogStream = {
  write: (message: string) => logger.http(message.trim()),
};
