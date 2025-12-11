import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import DownloadLog from "@/lib/models/DownloadLog";
import { authenticateUser } from "@/middleware/auth";

// GET /api/admin/download-logs - List download logs with filters
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const templateId = searchParams.get("templateId");
        const userId = searchParams.get("userId");
        const status = searchParams.get("status");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};
        if (templateId) query.templateId = templateId;
        if (userId) query.userId = userId;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const [logs, total] = await Promise.all([
            DownloadLog.find(query)
                .populate("templateId", "title thumbnail")
                .populate("userId", "name email avatar")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            DownloadLog.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("Error fetching download logs:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch download logs" },
            { status: 500 }
        );
    }
}
