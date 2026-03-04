import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitor extends Document {
  visitorId: string;
  firstVisit: Date;
  lastVisit: Date;
  userAgent?: string;
  ipHash?: string;
  pathHistory: {
    path: string;
    timestamp: Date;
  }[];
  visitCount: number;
}

const VisitorSchema: Schema = new Schema(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
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
  },
  { timestamps: true },
);

// Optimize performance with indexes
VisitorSchema.index({ lastVisit: -1 });

const Visitor: Model<IVisitor> =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
