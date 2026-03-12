import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import DownloadLog from "@/lib/models/DownloadLog";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getAdminDownloadStats(request: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        await connectToDatabase();

        const [results] = await DownloadLog.aggregate([
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
                totals: results.totals[0] || { total: 0, success: 0, failed: 0, totalBytes: 0 },
                topTemplates: results.topTemplates || [],
                downloadsByDay: results.downloadsByDay || [],
                recentDownloads: results.recentDownloads || [],
            },
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminGetDownloadStats" });
    }
}

export const GET = withAPIMiddleware(getAdminDownloadStats);

