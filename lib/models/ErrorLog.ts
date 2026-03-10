import mongoose, { Schema, Document, Model } from "mongoose";

export interface IErrorLog extends Document {
  message: string;
  stack?: string;
  digest?: string;
  route?: string;
  method?: string;
  status?: number;
  operation?: string;
  userId?: mongoose.Types.ObjectId;
  visitorId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

const ErrorLogSchema: Schema = new Schema(
  {
    message: { type: String, required: true },
    stack: { type: String },
    digest: { type: String },
    route: { type: String },
    method: { type: String },
    status: { type: Number },
    operation: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    visitorId: { type: String, index: true },
    userAgent: { type: String },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Indexes for performance
ErrorLogSchema.index({ timestamp: -1 });
ErrorLogSchema.index({ route: 1 });
ErrorLogSchema.index({ status: 1 });

const ErrorLog: Model<IErrorLog> =
  mongoose.models.ErrorLog || mongoose.model<IErrorLog>("ErrorLog", ErrorLogSchema);

export default ErrorLog;
