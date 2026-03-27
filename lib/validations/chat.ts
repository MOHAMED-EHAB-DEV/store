import * as v from "valibot";
import { UserSchema } from "./user";

export const ChatSchema = v.object({
  _id: v.string(),
  participants: v.array(v.union([v.string(), UserSchema])),
  lastMessageAt: v.union([v.date(), v.string()]),
  createdAt: v.union([v.date(), v.string()]),
});
