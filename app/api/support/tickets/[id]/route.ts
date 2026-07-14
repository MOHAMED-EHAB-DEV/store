import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import Ticket from "@/lib/models/Ticket";
import TicketMessage from "@/lib/models/TicketMessage";
import {
    createAPIResponse,
    createErrorResponse,
    withAPIMiddleware
} from "@/lib/utils/api-helpers";
import { authenticateUser } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get ticket details with messages
async function getTicket(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    await connectToDatabase();
    const user = await authenticateUser();

    const ticket = await Ticket.findById(id)
        .populate("user", "name email avatar")
        .lean();

    if (!ticket) {
        return createErrorResponse("Ticket not found", 404);
    }

    const isOwner = ticket.user._id.toString() === user?._id.toString();
    const isAdmin = user?.role === "admin";

    if (!isOwner && !isAdmin) {
        return createErrorResponse("Forbidden", 403);
    }

    const messages = await TicketMessage.findByTicket(id);
    const senderType = isAdmin ? "admin" : "user";
    await TicketMessage.markAsRead(id, senderType);

    return createAPIResponse({ ticket, messages });
}

// PATCH - Update ticket status
async function updateTicket(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const body = await request.json();
    const { status, priority } = body;

    await connectToDatabase();
    const user = await authenticateUser();

    const ticket = await Ticket.findById(id);
    if (!ticket) {
        return createErrorResponse("Ticket not found", 404);
    }

    const isOwner = ticket.user.toString() === user?._id.toString();
    const isAdmin = user?.role === "admin";

    if (!isOwner && !isAdmin) {
        return createErrorResponse("Forbidden", 403);
    }

    if (!isAdmin && status && status !== "closed") {
        return createErrorResponse("Users can only close tickets", 403);
    }

    const updateData: any = {};
    if (status && ["open", "resolved", "closed"].includes(status)) {
        updateData.status = status;
        if (status === "resolved" || status === "closed") {
            updateData.resolvedAt = new Date();
        }
    }
    if (isAdmin && priority && ["low", "medium", "high", "urgent"].includes(priority)) {
        updateData.priority = priority;
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, { new: true }).lean();

    return createAPIResponse(updatedTicket, { message: "Ticket updated" });
}

export const GET = withAPIMiddleware(getTicket);
export const PATCH = withAPIMiddleware(updateTicket);