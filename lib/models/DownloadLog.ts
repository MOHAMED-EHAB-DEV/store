import mongoose, { Schema, Document } from "mongoose";

export interface IDownloadLog extends Document {
    userId?: mongoose.Types.ObjectId;
    templateId: mongoose.Types.ObjectId;
    ip: string;
    userAgent?: string;
    filename: string;
    fileKey?: string;
    bytes?: number;
    status: "success" | "failed";
    statusCode?: number;
    meta?: any;
    createdAt: Date;
    updatedAt: Date;
}

const DownloadLogSchema = new Schema<IDownloadLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
        templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true, index: true },
        ip: { type: String, required: true },
        userAgent: { type: String, required: false },
        filename: { type: String, required: true },
        fileKey: { type: String, required: false },
        bytes: { type: Number, required: false },
        status: { type: String, enum: ["success", "failed"], default: "success" },
        statusCode: { type: Number, required: false },
        meta: { type: Schema.Types.Mixed, required: false },
    },
    { 
        timestamps: true,
        versionKey: false
    }
);

// Create indexes for better query performance
DownloadLogSchema.index({ templateId: 1, createdAt: -1 });
DownloadLogSchema.index({ userId: 1, createdAt: -1 });
DownloadLogSchema.index({ createdAt: -1 });

// Avoid model overwrite issues in serverless / hot-reloading environments
const DownloadLog = (mongoose.models.DownloadLog as mongoose.Model<IDownloadLog>) || mongoose.model<IDownloadLog>("DownloadLog", DownloadLogSchema);

export default DownloadLog;
