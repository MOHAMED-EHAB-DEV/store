import mongoose, { Schema, Document, Model } from "mongoose";

// For future user-to-user messaging
export interface IMessage extends Document {
    _id: string;
    chatId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    attachments?: string[];
    isRead: boolean;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 5000
    },
    attachments: [{
        type: String,
        trim: true
    }],
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Indexes
MessageSchema.index({ chatId: 1, createdAt: 1 });
MessageSchema.index({ chatId: 1, isRead: 1 });

// Static methods
MessageSchema.statics.findByChat = function (chatId: string, limit = 50, skip = 0) {
    return this.find({ chatId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: 1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

MessageSchema.statics.markAsRead = function (chatId: string, userId: string) {
    return this.updateMany(
        { chatId, sender: { $ne: userId }, isRead: false },
        { $set: { isRead: true } }
    );
};

export interface IMessageModel extends Model<IMessage> {
    findByChat(chatId: string, limit?: number, skip?: number): Promise<IMessage[]>;
    markAsRead(chatId: string, userId: string): Promise<any>;
}

const Message = (mongoose.models.Message as unknown as IMessageModel) ||
    mongoose.model<IMessage, IMessageModel>("Message", MessageSchema);

export default Message;
