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
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");
        const search = searchParams.get("search");

        const skip = (page - 1) * limit;

        const query: any = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: "i" } },
                { "user.name": { $regex: search, $options: "i" } },
            ];
        }

        const [tickets, total, stats] = await Promise.all([
            Ticket.find(query)
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Ticket.countDocuments(query),
            Ticket.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
                        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
                        closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total: 1,
                        open: 1,
                        inProgress: 1,
                        closed: 1
                    }
                }
            ])
        ]);

        return NextResponse.json({
            success: true,
            data: tickets,
            stats: stats[0] || { total: 0, open: 0, inProgress: 0, closed: 0 },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("Error fetching tickets:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch tickets" },
            { status: 500 }
        );
    }
}
