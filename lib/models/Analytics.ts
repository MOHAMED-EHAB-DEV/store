import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnalytics extends Document {
  visitorId: string;
  path: string;
  metrics: {
    name: string;
    value: number;
    rating: string;
    delta: number;
    id: string;
  }[];
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    path: { type: String, required: true, index: true },
    metrics: [
      {
        name: { type: String, required: true },
        value: { type: Number, required: true },
        rating: { type: String, enum: ["good", "needs-improvement", "poor"], required: true },
        delta: { type: Number, required: true },
        id: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for fast dashboard querying
AnalyticsSchema.index({ createdAt: -1 });
AnalyticsSchema.index({ visitorId: 1, createdAt: -1 });
AnalyticsSchema.index({ path: 1, createdAt: -1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
