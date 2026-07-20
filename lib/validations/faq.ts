import * as v from "valibot";

export const FAQSchema = v.object({
  _id: v.string(),
  question: v.string(),
  answer: v.string(),
  category: v.string(),
  order: v.number(),
  isPublished: v.boolean(),
  coverImage: v.optional(v.string()),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
});

export type IFAQ = v.InferOutput<typeof FAQSchema>;
