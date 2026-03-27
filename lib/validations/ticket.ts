import * as v from "valibot";
import { UserSchema } from "./user";

export const TicketSchema = v.object({
  _id: v.string(),
  user: v.union([v.string(), UserSchema]),
  subject: v.string(),
  status: v.union([v.literal("open"), v.literal("resolved"), v.literal("closed")]),
  priority: v.union([v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")]),
  category: v.union([v.literal("general"), v.literal("billing"), v.literal("technical"), v.literal("account"), v.literal("other"), v.literal("template customization")]),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
  lastMessageAt: v.union([v.date(), v.string()]),
  resolvedAt: v.optional(v.union([v.date(), v.string()])),
});
