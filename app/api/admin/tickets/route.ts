import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Ticket from "@/lib/models/Ticket";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        const status = searchParams.get("status");

        const query: any = {};
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
        console.error("Error fetching tickets:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch tickets" },
            { status: 500 }
        );
    }
}
