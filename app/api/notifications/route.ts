import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import Notification from "@/lib/models/Notification";
import {
    createAPIResponse,
    createErrorResponse,
    validatePagination,
    withAPIMiddleware
} from "@/lib/utils/api-helpers";

// GET - Get user's notifications
async function getNotifications(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return createErrorResponse("Unauthorized", 401);
    }

    await connectToDatabase();

    const { page, limit, skip } = validatePagination(request);
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const query: any = { recipient: decoded.userId };
    if (unreadOnly) {
        query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean(),
        Notification.countDocuments(query),
        Notification.getUnreadCount(decoded.userId)
    ]);

    return createAPIResponse({
        notifications,
        unreadCount
    }, {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
}

// PATCH - Mark notifications as read
async function markAsRead(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return createErrorResponse("Unauthorized", 401);
    }

    await connectToDatabase();

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
        await Notification.markAllAsRead(decoded.userId);
    } else if (notificationIds && Array.isArray(notificationIds)) {
        await Notification.updateMany(
            { _id: { $in: notificationIds }, recipient: decoded.userId },
            { isRead: true }
        );
    }

    const unreadCount = await Notification.getUnreadCount(decoded.userId);

    return createAPIResponse({ unreadCount }, { message: "Notifications marked as read" });
}

export const GET = withAPIMiddleware(getNotifications, {
    rateLimit: { maxRequests: 100, windowMs: 60 * 1000 }
});

export const PATCH = withAPIMiddleware(markAsRead);
