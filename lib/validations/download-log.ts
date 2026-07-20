import * as v from "valibot";
import { UserSchema } from "./user";
import { TemplateSchema } from "./template";

export const DownloadLogSchema = v.object({
  _id: v.optional(v.string()), 
  userId: v.optional(v.union([v.string(), UserSchema])),
  templateId: v.union([v.string(), TemplateSchema]),
  ip: v.string(),
  userAgent: v.optional(v.string()),
  filename: v.string(),
  fileKey: v.optional(v.string()),
  bytes: v.optional(v.number()),
  status: v.union([v.literal("success"), v.literal("failed")]),
  statusCode: v.optional(v.number()),
  meta: v.optional(v.any()),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
});

export type IDownloadLog = v.InferOutput<typeof DownloadLogSchema>;
