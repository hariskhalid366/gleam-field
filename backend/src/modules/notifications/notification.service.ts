import { Notification, NotificationTemplate, type NotificationChannel, type NotificationType } from "../../models/notification.model.js";
import { User } from "../../models/user.model.js";
import { logger } from "../../config/logger.js";

type SendInput = {
  userId?: string;
  audience?: "all" | "customers" | "technicians" | "admins";
  type: NotificationType;
  title?: string;
  body?: string;
  template?: string;
  channels?: NotificationChannel[];
  data?: Record<string, unknown>;
};

function interpolate(text: string, data: Record<string, unknown> = {}) {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => String(data[key] ?? ""));
}

/**
 * Single entry point every other module uses instead of rolling its own
 * email/push code. Delivery adapters are stubbed as `queued` records until a
 * provider is wired in — the persisted trail is already correct.
 */
export async function send(input: SendInput) {
  try {
    let title = input.title ?? "";
    let body = input.body ?? "";
    let channels: NotificationChannel[] = input.channels ?? ["in_app"];

    if (input.template) {
      const tpl = await NotificationTemplate.findOne({ key: input.template, isActive: true }).lean();
      if (tpl) {
        title = interpolate(tpl.subject, input.data);
        body = interpolate(tpl.body, input.data);
        channels = input.channels ?? tpl.channels;
      }
    }

    if (!title || !body) return null;

    return await Notification.create({
      user: input.userId,
      audience: input.audience,
      type: input.type,
      title,
      body,
      channels,
      data: input.data,
      deliveries: channels.map((channel) => ({ channel, status: "queued" as const, at: new Date() })),
    });
  } catch (err) {
    logger.error("Failed to queue notification", { type: input.type, err });
    return null;
  }
}

export async function broadcast(input: {
  audience: "all" | "customers" | "technicians" | "admins";
  title: string;
  body: string;
  channels: NotificationChannel[];
}) {
  const roleFilter =
    input.audience === "customers"
      ? { role: "customer" }
      : input.audience === "technicians"
        ? { role: "technician" }
        : input.audience === "admins"
          ? { role: { $in: ["admin", "super_admin"] } }
          : {};

  const recipients = await User.find({ isActive: true, ...roleFilter }).select("_id").lean();

  await Notification.insertMany(
    recipients.map((r) => ({
      user: r._id,
      audience: input.audience,
      type: "broadcast" as const,
      title: input.title,
      body: input.body,
      channels: input.channels,
      deliveries: input.channels.map((channel) => ({ channel, status: "queued" as const, at: new Date() })),
    })),
  );

  return { recipients: recipients.length };
}
