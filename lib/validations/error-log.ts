import * as v from "valibot";
import { UserSchema } from "./user";

export const ErrorLogSchema = v.object({
  _id: v.optional(v.string()),
  message: v.string(),
  stack: v.optional(v.string()),
  digest: v.optional(v.string()),
  route: v.optional(v.string()),
  method: v.optional(v.string()),
  status: v.optional(v.number()),
  operation: v.optional(v.string()),
  userId: v.optional(v.union([v.string(), UserSchema])),
  visitorId: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  ip: v.optional(v.string()),
  timestamp: v.union([v.date(), v.string()]),
});

export type IErrorLog = v.InferOutput<typeof ErrorLogSchema>;
