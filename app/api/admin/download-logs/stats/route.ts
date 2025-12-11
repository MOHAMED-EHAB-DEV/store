import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import DownloadLog from "@/lib/models/DownloadLog";
import { authenticateUser } from "@/middleware/auth";

// GET /api/admin/download-logs/stats - Get download statistics
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

        const [stats] = await DownloadLog.aggregate([
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                                failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
                                totalBytes: { $sum: { $ifNull: ["$bytes", 0] } },
                            },
                        },
                    ],
                    topTemplates: [
                        { $group: { _id: "$templateId", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 },
                        {
                            $lookup: {
                                from: "templates",
                                localField: "_id",
                                foreignField: "_id",
                                as: "template",
                            },
                        },
                        { $unwind: "$template" },
                        {
                            $project: {
                                _id: 1,
                                count: 1,
                                title: "$template.title",
                                thumbnail: "$template.thumbnail",
                            },
                        },
                    ],
                    downloadsByDay: [
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
                    recentDownloads: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: "templates",
                                localField: "templateId",
                                foreignField: "_id",
                                as: "template",
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        { $unwind: { path: "$template", preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                filename: 1,
                                status: 1,
                                createdAt: 1,
                                templateTitle: "$template.title",
                                userName: "$user.name",
                            },
                        },
                    ],
                },
            },
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totals: stats.totals[0] || { total: 0, success: 0, failed: 0, totalBytes: 0 },
                topTemplates: stats.topTemplates || [],
                downloadsByDay: stats.downloadsByDay || [],
                recentDownloads: stats.recentDownloads || [],
            },
        });
    } catch (error: any) {
        console.error("Error fetching download stats:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch download stats" },
            { status: 500 }
        );
    }
}
