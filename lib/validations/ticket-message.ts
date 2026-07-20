import * as v from "valibot";
import { UserSchema } from "./user";

export const TicketMessageSchema = v.object({
  _id: v.string(),
  ticketId: v.string(), 
  sender: v.union([v.string(), UserSchema]),
  senderType: v.union([v.literal("user"), v.literal("admin")]),
  content: v.string(),
  attachments: v.optional(v.array(v.string())),
  isRead: v.boolean(),
  createdAt: v.union([v.date(), v.string()]),
});

export type ITicketMessage = v.InferOutput<typeof TicketMessageSchema>;
