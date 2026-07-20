import * as v from "valibot";
import { UserSchema } from "./user";
import { TemplateSchema } from "./template";

export const ReviewSchema = v.object({
  _id: v.string(),
  user: v.union([v.string(), UserSchema]),
  template: v.union([v.string(), TemplateSchema]),
  rating: v.number(),
  comment: v.string(),
  isActive: v.boolean(),
  helpfulCount: v.number(),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
});

export type IReview = v.InferOutput<typeof ReviewSchema>;
