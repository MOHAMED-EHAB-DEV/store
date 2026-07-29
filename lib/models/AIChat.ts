import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIMessage {
  role: "user" | "model" | "system";
  content: string;
  timestamp: Date;
}

export interface IAIChat extends Document {
  chatId: string;
  userId?: mongoose.Types.ObjectId;
  visitorId?: string;
  name?: string;
  email?: string;
  ipAddress?: string;
  messages: IAIMessage[];
  isSpam: boolean;
  spamWarnings: number;
  isBanned: boolean;
  bannedUntil?: Date;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>({
  role: { type: String, enum: ["user", "model", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AIChatSchema = new Schema<IAIChat>(
  {
    chatId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    visitorId: { type: String, index: true },
    name: { type: String },
    email: { type: String },
    ipAddress: { type: String, index: true },
    messages: [AIMessageSchema],
    isSpam: { type: Boolean, default: false, index: true },
    spamWarnings: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false, index: true },
    bannedUntil: { type: Date },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Indexes for search queries
AIChatSchema.index({ email: 1, name: 1, chatId: 1, visitorId: 1, userId: 1 });
AIChatSchema.index({ createdAt: -1 });

const AIChat: Model<IAIChat> =
  mongoose.models.AIChat || mongoose.model<IAIChat>("AIChat", AIChatSchema);

export default AIChat;
