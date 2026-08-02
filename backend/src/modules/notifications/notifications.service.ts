import { AdminNotification, type NotificationCategory } from "../../models/adminNotification.model.js";
import { emitToRoom } from "../../sockets/index.js";

export async function notifyAdmins(input: { title: string; body: string; category: NotificationCategory; link?: string }) {
  const notification = await AdminNotification.create(input);
  emitToRoom("admins", "admin:notification", notification.toJSON());
  return notification;
}
