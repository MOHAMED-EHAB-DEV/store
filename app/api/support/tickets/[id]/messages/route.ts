import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import Ticket from "@/lib/models/Ticket";
import TicketMessage from "@/lib/models/TicketMessage";
import User from "@/lib/models/User";
import {
    createAPIResponse,
    createErrorResponse,
    validatePagination,
    withAPIMiddleware
} from "@/lib/utils/api-helpers";
import { notifyUserTicketReply, notifyAdminsTicketReply } from "@/lib/utils/notifications";

// Helper to get active users from socket server
async function getActiveUsers(ticketId: string): Promise<string[]> {
    try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
        const response = await fetch(`${socketUrl}/api/active-users/${ticketId}`, {
            next: { revalidate: 0 } // No cache
        });
        if (response.ok) {
            const data = await response.json();
            return data.users || [];
        }
    } catch (error) {
        console.error("Failed to fetch active users:", error);
    }
    return [];
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get messages for a ticket
async function getMessages(request: NextRequest, { params }: RouteParams) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return createErrorResponse("Invalid token", 401);
    }

    const { id } = await params;
    await connectToDatabase();

    const ticket = await Ticket.findById(id).lean();
    if (!ticket) {
        return createErrorResponse("Ticket not found", 404);
    }

    const isOwner = ticket.user.toString() === decoded.userId;
    const isAdmin = decoded.role === "admin";

    if (!isOwner && !isAdmin) {
        return createErrorResponse("Forbidden", 403);
    }

    const { limit, skip } = validatePagination(request);
    const messages = await TicketMessage.findByTicket(id, limit, skip);

    return createAPIResponse(messages);
}

// POST - Add message to ticket
async function addMessage(request: NextRequest, { params }: RouteParams) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return createErrorResponse("Invalid token", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { content, attachments } = body;

    if (!content?.trim()) {
        return createErrorResponse("Message content is required", 400);
    }

    await connectToDatabase();

    const ticket = await Ticket.findById(id);
    if (!ticket) {
        return createErrorResponse("Ticket not found", 404);
    }

    const isOwner = ticket.user.toString() === decoded.userId;
    const isAdmin = decoded.role === "admin";

    if (!isOwner && !isAdmin) {
        return createErrorResponse("Forbidden", 403);
    }

    if (ticket.status === "closed") {
        return createErrorResponse("Cannot add message to closed ticket", 400);
    }

    const senderType = isAdmin ? "admin" : "user";

    const message = await TicketMessage.create({
        ticketId: id,
        sender: decoded.userId,
        senderType,
        content: content.trim(),
        attachments: attachments || [],
        isRead: false
    });

    const ticketUpdate: any = { lastMessageAt: new Date() };
    if (ticket.status === "resolved" && senderType === "user") {
        ticketUpdate.status = "open";
    }
    await Ticket.findByIdAndUpdate(id, ticketUpdate);

    const populatedMessage = await TicketMessage.findById(message._id)
        .populate("sender", "name avatar role")
        .lean();


    // Fetch active users in the ticket room
    const activeUsers = await getActiveUsers(id);

    // Send notifications
    if (senderType === "admin") {
        // Notify user about admin reply if not active
        const recipientId = ticket.user.toString();

        if (!activeUsers.includes(recipientId)) {
            await notifyUserTicketReply(recipientId, id, ticket.subject);
        }
    } else {
        // Notify admins about user reply, excluding active admins
        const user = await User.findById(decoded.userId).select("name").lean();
        const userName = user?.name || "Customer";
        // Pass active users to exclude them
        await notifyAdminsTicketReply(id, ticket.subject, userName, activeUsers);
    }

    return createAPIResponse(populatedMessage, { message: "Message added" });
}

export const GET = withAPIMiddleware(getMessages);
export const POST = withAPIMiddleware(addMessage, {
    rateLimit: { maxRequests: 60, windowMs: 15 * 60 * 1000 }
});
