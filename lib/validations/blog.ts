import * as v from "valibot";
import { UserSchema } from "./user";

export const BlogSchema = v.object({
  _id: v.string(),
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  excerpt: v.optional(v.string()),
  coverImage: v.optional(v.string()),
  tags: v.array(v.string()),
  author: v.optional(v.union([v.string(), UserSchema])),
  isPublished: v.boolean(),
  publishedAt: v.optional(v.union([v.date(), v.string()])),
  views: v.number(),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
});
