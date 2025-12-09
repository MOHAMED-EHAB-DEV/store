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
import { notifyAdminsNewTicket } from "@/lib/utils/notifications";

// GET - List user's tickets
async function getTickets(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return createErrorResponse("Invalid token", 401);
    }

    await connectToDatabase();

    const { page, limit, skip } = validatePagination(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: any = { user: decoded.userId };
    if (status && ["open", "resolved", "closed"].includes(status)) {
        query.status = status;
    }

    const [tickets, total] = await Promise.all([
        Ticket.find(query)
            .select("subject status priority category lastMessageAt createdAt")
            .sort({ lastMessageAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean(),
        Ticket.countDocuments(query)
    ]);

    return createAPIResponse(tickets, {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
}

// POST - Create new ticket
async function createTicket(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return createErrorResponse("Invalid token", 401);
    }

    const body = await request.json();
    const { subject, description, category, priority, attachments } = body;

    if (!subject?.trim() || !description?.trim()) {
        return createErrorResponse("Subject and description are required", 400);
    }

    await connectToDatabase();

    // Get user name for notification
    const user = await User.findById(decoded.userId).select("name").lean();
    const userName = user?.name || "A user";

    const ticket = await Ticket.create({
        user: decoded.userId,
        subject: subject.trim(),
        category: category || "general",
        priority: priority || "medium",
        lastMessageAt: new Date()
    });

    await TicketMessage.create({
        ticketId: ticket._id,
        sender: decoded.userId,
        senderType: "user",
        content: description.trim(),
        attachments: attachments || [],
        isRead: false
    });

    // Notify admins about new ticket
    await notifyAdminsNewTicket(ticket._id.toString(), subject.trim(), userName);

    return createAPIResponse({
        _id: ticket._id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category
    }, { message: "Ticket created successfully" });
}

export const GET = withAPIMiddleware(getTickets, {
    rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 }
});

export const POST = withAPIMiddleware(createTicket, {
    rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 }
});
