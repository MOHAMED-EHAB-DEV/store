import * as v from "valibot";
import { UserSchema } from "./user";

export const MessageSchema = v.object({
  _id: v.string(),
  chatId: v.string(),
  sender: v.union([v.string(), UserSchema]),
  content: v.string(),
  attachments: v.optional(v.array(v.string())),
  isRead: v.boolean(),
  createdAt: v.union([v.date(), v.string()]),
});
