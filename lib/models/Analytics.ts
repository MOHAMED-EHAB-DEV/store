import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnalytics extends Document {
  visitorId: string;
  date: string; // YYYY-MM-DD
  pages: {
    path: string;
    metrics: {
      name: string;
      value: number;
      rating: string;
      delta: number;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    visitorId: { type: String, required: true },
    date: { type: String, required: true },
    pages: [
      {
        path: { type: String, required: true },
        metrics: [
          {
            name: { type: String, required: true },
            value: { type: Number, required: true },
            rating: { type: String, enum: ["good", "needs-improvement", "poor"], required: true },
            delta: { type: Number, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Indexes for fast dashboard querying and upserting
AnalyticsSchema.index({ visitorId: 1, date: 1 }, { unique: true });
AnalyticsSchema.index({ createdAt: -1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
