import winston from "winston";
import "winston-daily-rotate-file";
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
  transports: [
    new winston.transports.Console(),
    ...(env.isProd
      ? [
          new winston.transports.DailyRotateFile({
            dirname: "logs",
            filename: "app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "14d",
            zippedArchive: true,
          }),
          new winston.transports.DailyRotateFile({
            dirname: "logs",
            filename: "error-%DATE%.log",
            level: "error",
            datePattern: "YYYY-MM-DD",
            maxFiles: "30d",
            zippedArchive: true,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

/** morgan → winston bridge */
export const httpLogStream = {
  write: (message: string) => logger.http(message.trim()),
};
