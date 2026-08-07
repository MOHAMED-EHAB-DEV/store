import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitor extends Document {
  visitorId: string;
  source: "store" | "portfolio";
  firstVisit: Date;
  lastVisit: Date;
  userAgent?: string;
  ipHash?: string;
  pathHistory: {
    path: string;
    timestamp: Date;
  }[];
  visitCount: number;
  userId?: mongoose.Types.ObjectId | string;
}

const VisitorSchema: Schema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    source: {
      type: String,
      enum: ["store", "portfolio"],
      default: "store",
      required: true,
      index: true,
    },
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    userAgent: { type: String },
    ipHash: { type: String },
    pathHistory: [
      {
        path: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    visitCount: { type: Number, default: 1 },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Optimize performance with indexes
VisitorSchema.index({ visitorId: 1, source: 1 }, { unique: true });
VisitorSchema.index({ source: 1, lastVisit: -1 });

const Visitor: Model<IVisitor> =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
