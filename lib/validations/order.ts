import * as v from "valibot";
import { UserSchema } from "./user";
import { TemplateSchema } from "./template";

export const OrderSchema = v.object({
  _id: v.string(),
  user: v.union([v.string(), UserSchema]),
  templates: v.array(v.union([v.string(), TemplateSchema])),
  totalAmount: v.number(),
  paymentStatus: v.union([v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded"), v.literal("cancelled")]),
  paymentMethod: v.union([v.literal("credit_card"), v.literal("paypal"), v.literal("stripe")]),
  paymentId: v.optional(v.string()),
  currency: v.union([v.literal("USD"), v.literal("EUR"), v.literal("GBP")]),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
});
