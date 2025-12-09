import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import Ticket from "@/lib/models/Ticket";
import {
    createAPIResponse,
    createErrorResponse,
    validatePagination,
    withAPIMiddleware
} from "@/lib/utils/api-helpers";

// GET - Admin: List all tickets
async function getAdminTickets(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
        return createErrorResponse("Forbidden", 403);
    }

    await connectToDatabase();

    const { page, limit, skip } = validatePagination(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    const query: any = {};
    if (status && ["open", "resolved", "closed"].includes(status)) {
        query.status = status;
    }
    if (priority && ["low", "medium", "high", "urgent"].includes(priority)) {
        query.priority = priority;
    }
    if (category && ["general", "billing", "technical", "account", "other"].includes(category)) {
        query.category = category;
    }

    const [tickets, total] = await Promise.all([
        Ticket.find(query)
            .populate("user", "name email avatar")
            .select("subject status priority category lastMessageAt createdAt user")
            .sort({ priority: -1, lastMessageAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean(),
        Ticket.countDocuments(query)
    ]);

    return createAPIResponse(tickets, {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
}

export const GET = withAPIMiddleware(getAdminTickets, {
    rateLimit: { maxRequests: 200, windowMs: 15 * 60 * 1000 }
});
