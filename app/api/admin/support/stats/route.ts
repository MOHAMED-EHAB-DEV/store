import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import Ticket from "@/lib/models/Ticket";
import {
    createAPIResponse,
    createErrorResponse,
    withAPIMiddleware,
    APICache
} from "@/lib/utils/api-helpers";

// GET - Support statistics
async function getStats(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return createErrorResponse("Unauthorized", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
        return createErrorResponse("Forbidden", 403);
    }

    await connectToDatabase();

    const stats = await Ticket.aggregate([
        {
            $facet: {
                byStatus: [
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ],
                byPriority: [
                    { $group: { _id: "$priority", count: { $sum: 1 } } }
                ],
                byCategory: [
                    { $group: { _id: "$category", count: { $sum: 1 } } }
                ],
                totals: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
                            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
                            closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
                            urgent: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
                            high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } }
                        }
                    }
                ],
                recentTickets: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "userInfo"
                        }
                    },
                    { $unwind: "$userInfo" },
                    {
                        $project: {
                            subject: 1,
                            status: 1,
                            priority: 1,
                            createdAt: 1,
                            "user.name": "$userInfo.name",
                            "user.email": "$userInfo.email"
                        }
                    }
                ]
            }
        }
    ]);

    const result = stats[0];

    return createAPIResponse({
        totals: result.totals[0] || { total: 0, open: 0, resolved: 0, closed: 0, urgent: 0, high: 0 },
        byStatus: result.byStatus,
        byPriority: result.byPriority,
        byCategory: result.byCategory,
        recentTickets: result.recentTickets
    });
}

export const GET = withAPIMiddleware(getStats, {
    cache: { ttl: 60 * 1000 } // Cache for 1 minute
});
