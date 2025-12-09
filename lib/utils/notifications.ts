import { connectToDatabase } from "@/lib/database";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";

interface CreateNotificationParams {
    recipientId: string;
    type: "ticket_created" | "ticket_reply" | "ticket_status_changed" | "system";
    title: string;
    message: string;
    link?: string;
    relatedTicketId?: string;
}


async function sendRealTimeNotification(recipientId: string, notification: any) {
    try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
        await fetch(`${socketUrl}/api/send-notification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipientId, notification })
        });
    } catch (error) {
        console.error("RT notification failed:", error);
    }
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
    await connectToDatabase();

    const notification = await Notification.create({
        recipient: params.recipientId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || "",
        relatedTicket: params.relatedTicketId
    });

    sendRealTimeNotification(params.recipientId, notification);

    return notification;
}

/**
 * Notify all admins about a new ticket
 */
export async function notifyAdminsNewTicket(ticketId: string, ticketSubject: string, userName: string) {
    await connectToDatabase();

    const admins = await User.find({ role: "admin" }).select("_id").lean();

    const notifications = admins.map(admin => ({
        recipient: admin._id,
        type: "ticket_created" as const,
        title: "New Support Ticket",
        message: `${userName} created a new ticket: "${ticketSubject}"`,
        link: `/admin/support/${ticketId}`,
        relatedTicket: ticketId
    }));

    if (notifications.length > 0) {
        const created = await Notification.insertMany(notifications);
        created.forEach(n => sendRealTimeNotification(n.recipient.toString(), n));
    }
}

/**
 * Notify user about a reply from admin
 */
export async function notifyUserTicketReply(userId: string, ticketId: string, ticketSubject: string) {
    return createNotification({
        recipientId: userId,
        type: "ticket_reply",
        title: "New Reply to Your Ticket",
        message: `Support team replied to: "${ticketSubject}"`,
        link: `/dashboard/support/${ticketId}`,
        relatedTicketId: ticketId
    });
}

/**
 * Notify admins about a reply from user
 */
export async function notifyAdminsTicketReply(ticketId: string, ticketSubject: string, userName: string, excludeUserIds: string[] = []) {
    await connectToDatabase();

    const admins = await User.find({ role: "admin" }).select("_id").lean();

    const notifications = admins
        .filter(admin => !excludeUserIds.includes(admin._id.toString()))
        .map(admin => ({
            recipient: admin._id,
            type: "ticket_reply" as const,
            title: "Customer Replied",
            message: `${userName} replied to: "${ticketSubject}"`,
            link: `/admin/support/${ticketId}`,
            relatedTicket: ticketId
        }));

    if (notifications.length > 0) {
        const created = await Notification.insertMany(notifications);
        created.forEach(n => sendRealTimeNotification(n.recipient.toString(), n));
    }
}

/**
 * Notify user about ticket status change
 */
export async function notifyUserTicketStatusChanged(
    userId: string,
    ticketId: string,
    ticketSubject: string,
    newStatus: string
) {
    const statusMessages: Record<string, string> = {
        open: "reopened",
        resolved: "marked as resolved",
        closed: "closed"
    };

    return createNotification({
        recipientId: userId,
        type: "ticket_status_changed",
        title: "Ticket Status Updated",
        message: `Your ticket "${ticketSubject}" has been ${statusMessages[newStatus] || newStatus}`,
        link: `/dashboard/support/${ticketId}`,
        relatedTicketId: ticketId
    });
}

