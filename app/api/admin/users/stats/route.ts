import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";

// GET /api/admin/users/stats - Get user statistics
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const [stats] = await User.aggregate([
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                admins: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
                                users: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } },
                                premium: { $sum: { $cond: [{ $eq: ["$tier", "premium"] }, 1, 0] } },
                                free: { $sum: { $cond: [{ $eq: ["$tier", "free"] }, 1, 0] } },
                                verified: { $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] } },
                            },
                        },
                    ],
                    recentUsers: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 },
                        { $project: { name: 1, email: 1, avatar: 1, tier: 1, createdAt: 1 } },
                    ],
                    signupsByDay: [
                        {
                            $match: {
                                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                            },
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                },
            },
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totals: stats.totals[0] || { total: 0, admins: 0, users: 0, premium: 0, free: 0, verified: 0 },
                recentUsers: stats.recentUsers || [],
                signupsByDay: stats.signupsByDay || [],
            },
        });
    } catch (error: any) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch user stats" },
            { status: 500 }
        );
    }
}
