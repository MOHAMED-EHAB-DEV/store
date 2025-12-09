import mongoose, { Schema, Document, Model } from "mongoose";

// For future user-to-user messaging
export interface IChat extends Document {
    _id: string;
    participants: mongoose.Types.ObjectId[];
    lastMessageAt: Date;
    createdAt: Date;
}

const ChatSchema = new Schema<IChat>({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Indexes
ChatSchema.index({ participants: 1 });
ChatSchema.index({ participants: 1, lastMessageAt: -1 });

// Static methods
ChatSchema.statics.findByParticipant = function (userId: string, limit = 20, skip = 0) {
    return this.find({ participants: userId })
        .populate('participants', 'name avatar')
        .sort({ lastMessageAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

ChatSchema.statics.findBetweenUsers = function (userId1: string, userId2: string) {
    return this.findOne({
        participants: { $all: [userId1, userId2] }
    }).lean();
};

export interface IChatModel extends Model<IChat> {
    findByParticipant(userId: string, limit?: number, skip?: number): Promise<IChat[]>;
    findBetweenUsers(userId1: string, userId2: string): Promise<IChat | null>;
}

const Chat = (mongoose.models.Chat as unknown as IChatModel) ||
    mongoose.model<IChat, IChatModel>("Chat", ChatSchema);

export default Chat;
