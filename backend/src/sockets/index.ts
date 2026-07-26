import type { Server as HttpServer } from "node:http";
import { Server as IOServer, type Socket } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { verifyAccessToken } from "../utils/token.js";

/**
 * Structure only — real-time features (live tracking, dispatch, notifications)
 * plug into these rooms and event names without changing the HTTP layer.
 */
let io: IOServer | null = null;

export function initSockets(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
    path: "/socket.io",
  });

  // JWT handshake — unauthenticated sockets are rejected before joining rooms.
  io.use((socket, next) => {
    try {
      const token = (socket.handshake.auth?.token as string | undefined)?.replace(/^Bearer /, "");
      if (!token) return next(new Error("Unauthorized"));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const { userId, role } = socket.data as { userId: string; role: string };
    void socket.join(`user:${userId}`);
    if (role === "admin" || role === "super_admin") void socket.join("admins");
    logger.debug("Socket connected", { userId, role, id: socket.id });

    socket.on("booking:subscribe", (bookingId: string) => {
      if (typeof bookingId === "string" && /^[a-f\d]{24}$/i.test(bookingId)) {
        void socket.join(`booking:${bookingId}`);
      }
    });

    socket.on("technician:location", (payload: { bookingId?: string; lat?: number; lng?: number }) => {
      if (!payload?.bookingId) return;
      socket.to(`booking:${payload.bookingId}`).emit("technician:location", payload);
    });

    socket.on("disconnect", () => logger.debug("Socket disconnected", { id: socket.id }));
  });

  return io;
}

export function emitToRoom(room: string, event: string, payload: unknown): void {
  io?.to(room).emit(event, payload);
}
