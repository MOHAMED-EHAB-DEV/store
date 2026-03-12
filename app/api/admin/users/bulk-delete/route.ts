import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function bulkDeleteUsers(req: NextRequest) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();

        const body = await req.json();
        const { userIds } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return createErrorResponse("User IDs array is required", 400, { req });
        }

        const result = await User.deleteMany({
            _id: { $in: userIds },
            role: { $ne: "admin" }, // Prevent deleting admin users
        });

        return NextResponse.json({
            message: `${result.deletedCount} users deleted successfully`,
            deletedCount: result.deletedCount,
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "adminBulkDeleteUsers" });
    }
}

export const POST = withAPIMiddleware(bulkDeleteUsers);

