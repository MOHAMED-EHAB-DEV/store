import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Ticket from "@/lib/models/Ticket";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getUserTickets(req: NextRequest) {
    try {
        await connectToDatabase();
        const user = await authenticateUser();
        if (!user) {
            return createErrorResponse("Unauthorized", 401, { req });
        }


        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        const status = searchParams.get("status");

        const query: any = { user: user._id };
        if (status) {
            query.status = status;
        }

        const tickets = await Ticket.find(query)
            .populate("user", "name email")
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            message: "Tickets fetched successfully",
            data: tickets,
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "getUserTickets" });
    }
}

export const GET = withAPIMiddleware(getUserTickets);

