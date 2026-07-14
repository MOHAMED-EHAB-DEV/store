import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { authenticateUser } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { uploadToGoogleDrive } from "@/lib/google-drive";
import Ticket from "@/lib/models/Ticket";
import TicketMessage from "@/lib/models/TicketMessage";
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
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        console.error("Failed to fetch active users:", error);
    }
    return [];
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get messages for a ticket
async function getMessages(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    await connectToDatabase();
    const user = await authenticateUser();

    const ticket = await Ticket.findById(id).lean();
    if (!ticket) {
        return createErrorResponse("Ticket not found", 404);
    }

    const isOwner = ticket.user.toString() === user?._id.toString();
    const isAdmin = user?.role === "admin";

    if (!isOwner && !isAdmin) {
        return createErrorResponse("Forbidden", 403);
    }

    const { limit, skip } = validatePagination(request);
    const messages = await TicketMessage.findByTicket(id, limit, skip);

    return createAPIResponse(messages);
}

// POST - Add message to ticket
async function addMessage(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const files = formData.getAll("attachments") as File[];

    if (!content?.trim() && (!files || files.length === 0)) {
        return createErrorResponse("Message content or attachments are required", 400);
    }

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

    if (ticket.status === "closed") {
        return createErrorResponse("Cannot add message to closed ticket", 400);
    }

    const senderType = isAdmin ? "admin" : "user";

    let attachmentsUrls: string[] = [];
    if (files && files.length > 0) {
        for (const file of files) {
            const isImage = file.type.startsWith("image/");
            
            if (isImage) {
                // Upload images to Cloudinary
                const buffer = Buffer.from(await file.arrayBuffer());
                const uploadResult = await uploadToCloudinary(buffer, "support_tickets", "image");
                attachmentsUrls.push(uploadResult.secure_url);
            } else {
                // Upload everything else to Google Drive
                const driveFileId = await uploadToGoogleDrive(file);
                // Create a direct download link for the drive file
                const driveUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
                attachmentsUrls.push(driveUrl);
            }
        }
    }

    const message = await TicketMessage.create({
        ticketId: id,
        sender: user?._id,
        senderType,
        content: content?.trim() || "",
        attachments: attachmentsUrls,
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
