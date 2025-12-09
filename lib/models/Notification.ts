import mongoose, { Document, Schema, Model } from "mongoose";

export interface INotification extends Document {
    _id: string;
    recipient: mongoose.Types.ObjectId;
    type: "ticket_created" | "ticket_reply" | "ticket_status_changed" | "system";
    title: string;
    message: string;
    link?: string;
    relatedTicket?: mongoose.Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
}

interface INotificationModel extends Model<INotification> {
    getUnreadCount(userId: string): Promise<number>;
    markAllAsRead(userId: string): Promise<void>;
}

const NotificationSchema = new Schema<INotification>({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["ticket_created", "ticket_reply", "ticket_status_changed", "system"],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    link: {
        type: String,
        default: ""
    },
    relatedTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        index: true
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false,
    versionKey: false
});

// Compound index for efficient queries
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Static methods
NotificationSchema.statics.getUnreadCount = async function (userId: string): Promise<number> {
    return this.countDocuments({ recipient: userId, isRead: false });
};

NotificationSchema.statics.markAllAsRead = async function (userId: string): Promise<void> {
    await this.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

const Notification = (mongoose.models.Notification as unknown as INotificationModel) ||
    mongoose.model<INotification, INotificationModel>("Notification", NotificationSchema);

export default Notification;
