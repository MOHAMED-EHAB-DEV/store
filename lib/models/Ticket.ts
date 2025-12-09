import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITicket extends Document {
    _id: string;
    user: mongoose.Types.ObjectId;
    subject: string;
    status: "open" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    category: "general" | "billing" | "technical" | "account" | "other";
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date;
    resolvedAt?: Date;
}

const TicketSchema = new Schema<ITicket>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    status: {
        type: String,
        enum: ["open", "resolved", "closed"],
        default: "open",
        index: true
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
        index: true
    },
    category: {
        type: String,
        enum: ["general", "billing", "technical", "account", "other"],
        default: "general",
        index: true
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true,
    versionKey: false
});

// Compound indexes for common queries
TicketSchema.index({ user: 1, status: 1, createdAt: -1 });
TicketSchema.index({ status: 1, priority: 1, lastMessageAt: -1 });
TicketSchema.index({ status: 1, createdAt: -1 });

// Static methods
TicketSchema.statics.findByUser = function (userId: string, limit = 20, skip = 0) {
    return this.find({ user: userId })
        .select('subject status priority category lastMessageAt createdAt')
        .sort({ lastMessageAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

TicketSchema.statics.findOpenTickets = function (limit = 50, skip = 0) {
    return this.find({ status: { $in: ["open", "resolved"] } })
        .populate('user', 'name email avatar')
        .select('subject status priority category lastMessageAt createdAt user')
        .sort({ priority: -1, lastMessageAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

TicketSchema.statics.getStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
                resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
                urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
                high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
            }
        }
    ]);
};

export interface ITicketModel extends Model<ITicket> {
    findByUser(userId: string, limit?: number, skip?: number): Promise<ITicket[]>;
    findOpenTickets(limit?: number, skip?: number): Promise<ITicket[]>;
    getStats(): Promise<any[]>;
}

const Ticket = (mongoose.models.Ticket as unknown as ITicketModel) ||
    mongoose.model<ITicket, ITicketModel>("Ticket", TicketSchema);

export default Ticket;
