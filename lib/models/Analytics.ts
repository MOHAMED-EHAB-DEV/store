import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebVitalMetric {
  name: string; // LCP, INP, CLS, TTFB, FCP
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  updatedAt?: Date;
}

export interface IPageAnalytics {
  path: string;
  metrics: IWebVitalMetric[];
}

export interface IAnalytics extends Document {
  visitorId: string;
  source: "store" | "portfolio";
  pages: IPageAnalytics[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    source: {
      type: String,
      enum: ["store", "portfolio"],
      default: "store",
      required: true,
      index: true,
    },
    pages: [
      {
        path: { type: String, required: true },
        metrics: [
          {
            name: { type: String, required: true },
            value: { type: Number, required: true },
            rating: { type: String, enum: ["good", "needs-improvement", "poor"], required: true },
            delta: { type: Number, required: true },
            updatedAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

AnalyticsSchema.index({ visitorId: 1, source: 1 }, { unique: true });
AnalyticsSchema.index({ source: 1, "pages.path": 1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
