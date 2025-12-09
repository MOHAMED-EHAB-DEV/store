import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITicketMessage extends Document {
    _id: string;
    ticketId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    senderType: "user" | "admin";
    content: string;
    attachments?: string[];
    isRead: boolean;
    createdAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderType: {
        type: String,
        enum: ["user", "admin"],
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 10000
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
TicketMessageSchema.index({ ticketId: 1, createdAt: 1 });
TicketMessageSchema.index({ ticketId: 1, isRead: 1, senderType: 1 });

// Static methods
TicketMessageSchema.statics.findByTicket = function (ticketId: string, limit = 50, skip = 0) {
    return this.find({ ticketId })
        .populate('sender', 'name avatar role')
        .sort({ createdAt: 1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

TicketMessageSchema.statics.markAsRead = function (ticketId: string, senderType: "user" | "admin") {
    // Mark messages as read for the opposite sender type
    const targetSenderType = senderType === "user" ? "admin" : "user";
    return this.updateMany(
        { ticketId, senderType: targetSenderType, isRead: false },
        { $set: { isRead: true } }
    );
};

TicketMessageSchema.statics.getUnreadCount = function (ticketId: string, forSenderType: "user" | "admin") {
    // Count unread messages from the opposite sender type
    const targetSenderType = forSenderType === "user" ? "admin" : "user";
    return this.countDocuments({ ticketId, senderType: targetSenderType, isRead: false });
};

export interface ITicketMessageModel extends Model<ITicketMessage> {
    findByTicket(ticketId: string, limit?: number, skip?: number): Promise<ITicketMessage[]>;
    markAsRead(ticketId: string, senderType: "user" | "admin"): Promise<any>;
    getUnreadCount(ticketId: string, forSenderType: "user" | "admin"): Promise<number>;
}

const TicketMessage = (mongoose.models.TicketMessage as unknown as ITicketMessageModel) ||
    mongoose.model<ITicketMessage, ITicketMessageModel>("TicketMessage", TicketMessageSchema);

export default TicketMessage;
