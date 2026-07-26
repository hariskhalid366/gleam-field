import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { initSockets } from "./sockets/index.js";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);
  initSockets(server);

  server.listen(env.PORT, () => {
    logger.info(`ServicePro API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`Swagger docs at http://localhost:${env.PORT}/docs`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => logger.error("Unhandled rejection", { reason }));
  process.on("uncaughtException", (err) => {
    logger.error(err);
    process.exit(1);
  });
}

void bootstrap().catch((err) => {
  logger.error(err);
  process.exit(1);
});
