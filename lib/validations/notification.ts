import * as v from "valibot";
import { UserSchema } from "./user";

export const NotificationSchema = v.object({
  _id: v.string(),
  recipient: v.union([v.string(), UserSchema]),
  type: v.union([v.literal("ticket_created"), v.literal("ticket_reply"), v.literal("ticket_status_changed"), v.literal("system")]),
  title: v.string(),
  message: v.string(),
  link: v.optional(v.string()),
  relatedTicket: v.optional(v.string()),
  isRead: v.boolean(),
  createdAt: v.union([v.date(), v.string()]),
});

export type INotification = v.InferOutput<typeof NotificationSchema>;
