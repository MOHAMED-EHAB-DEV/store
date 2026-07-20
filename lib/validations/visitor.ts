import * as v from "valibot";

export const VisitorSchema = v.object({
  _id: v.optional(v.string()),
  visitorId: v.string(),
  firstVisit: v.union([v.date(), v.string()]),
  lastVisit: v.union([v.date(), v.string()]),
  userAgent: v.optional(v.string()),
  ipHash: v.optional(v.string()),
  pathHistory: v.array(v.object({
    path: v.string(),
    timestamp: v.union([v.date(), v.string()]),
  })),
  visitCount: v.number(),
});

export type IVisitor = v.InferOutput<typeof VisitorSchema>;
