import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import Ticket from "@/lib/models/Ticket";
import {
    createAPIResponse,
    createErrorResponse,
    handleApiError,
    withAPIMiddleware
} from "@/lib/utils/api-helpers";
import { notifyUserTicketStatusChanged } from "@/lib/utils/notifications";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH - Admin: Update ticket
async function updateAdminTicket(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== "admin") {
            return createErrorResponse("Forbidden", 403, { req: request });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, priority, category } = body;

        await connectToDatabase();

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return createErrorResponse("Ticket not found", 404, { req: request, operation: "adminUpdateTicket" });
        }

        const updateData: any = {};

        if (status && ["open", "resolved", "closed"].includes(status)) {
            updateData.status = status;
            if (status === "resolved" || status === "closed") {
                updateData.resolvedAt = new Date();
            }
        }
        if (priority && ["low", "medium", "high", "urgent"].includes(priority)) {
            updateData.priority = priority;
        }
        if (category && ["general", "billing", "technical", "account", "other"].includes(category)) {
            updateData.category = category;
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, { new: true })
            .populate("user", "name email avatar")
            .lean();

        // Notify user if status changed
        if (status && status !== ticket.status) {
            await notifyUserTicketStatusChanged(
                ticket.user.toString(),
                id,
                ticket.subject,
                status
            );
        }

        return createAPIResponse(updatedTicket, { message: "Ticket updated" });
    } catch (error: any) {
        return handleApiError(error, request, { operation: "adminUpdateTicket" });
    }
}

export const PATCH = withAPIMiddleware(updateAdminTicket);
