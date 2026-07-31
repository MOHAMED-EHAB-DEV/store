import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAPIMetricEntry {
  duration: number;
  statusCode: number;
  cacheHit?: boolean;
  rateLimited?: boolean;
  timestamp: Date;
}

export interface IAPIMetrics extends Document {
  route: string;
  method: string;
  metrics: IAPIMetricEntry[];
  avgDuration: number;
  totalRequests: number;
  errorCount: number;
  cacheHitCount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const APIMetricEntrySchema = new Schema(
  {
    duration: { type: Number, required: true },
    statusCode: { type: Number, required: true },
    cacheHit: { type: Boolean, default: false },
    rateLimited: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const APIMetricsSchema: Schema = new Schema(
  {
    route: { type: String, required: true },
    method: { type: String, required: true },
    metrics: [APIMetricEntrySchema],
    avgDuration: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    cacheHitCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

APIMetricsSchema.index({ route: 1, method: 1 }, { unique: true });
APIMetricsSchema.index({ lastUpdated: -1 });

const APIMetrics: Model<IAPIMetrics> =
  mongoose.models.APIMetrics || mongoose.model<IAPIMetrics>("APIMetrics", APIMetricsSchema);

export default APIMetrics;
