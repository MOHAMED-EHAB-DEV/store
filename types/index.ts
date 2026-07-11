import * as v from "valibot";
import { UserSchema, TemplateSchema, CategorySchema, ReviewSchema, OrderSchema, TicketSchema, TicketMessageSchema, NotificationSchema, DownloadLogSchema, VisitorSchema, BlogSchema, ChatSchema, ErrorLogSchema, FAQSchema, MessageSchema } from "@/lib/validations";
export type StepKey = "buy" | "download" | "setup" | "customize" | "launch";

export interface Step {
  key: StepKey;
  title: string;
  description: string;
  color: string; // hex, drives node/glow fill — keep in sync with your existing gradient accents
  optional?: boolean;
}
export type IUser = v.InferOutput<typeof UserSchema>;
export type ITemplate = v.InferOutput<typeof TemplateSchema>;
export type ICategory = v.InferOutput<typeof CategorySchema>;
export type IReview = v.InferOutput<typeof ReviewSchema>;
export type IOrder = v.InferOutput<typeof OrderSchema>;
export type ITicket = v.InferOutput<typeof TicketSchema>;
export type ITicketMessage = v.InferOutput<typeof TicketMessageSchema>;
export type INotification = v.InferOutput<typeof NotificationSchema>;
export type IDownloadLog = v.InferOutput<typeof DownloadLogSchema>;
export type IVisitor = v.InferOutput<typeof VisitorSchema>;
export type IBlog = v.InferOutput<typeof BlogSchema>;
export type IChat = v.InferOutput<typeof ChatSchema>;
export type IErrorLog = v.InferOutput<typeof ErrorLogSchema>;
export type IFAQ = v.InferOutput<typeof FAQSchema>;
export type IMessage = v.InferOutput<typeof MessageSchema>;
