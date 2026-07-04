import * as v from "valibot";

export const CategorySchema = v.object({
  _id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  slug: v.string(),
  isActive: v.boolean(),
  templateCount: v.number(),
  sortOrder: v.number(),
  icon: v.optional(v.string()),
  parentCategory: v.optional(v.nullable(v.string())),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
});
