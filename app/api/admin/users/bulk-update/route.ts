import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function bulkUpdateUsers(req: NextRequest) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();

        const body = await req.json();
        const { userIds, updates } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return createErrorResponse("User IDs array is required", 400, { req });
        }

        if (!updates || typeof updates !== "object") {
            return createErrorResponse("Updates object is required", 400, { req });
        }

        const result = await User.updateMany(
            {
                _id: { $in: userIds },
                role: { $ne: "admin" }, // Prevent updating admin users
            },
            { $set: updates }
        );

        return NextResponse.json({
            message: `${result.modifiedCount} users updated successfully`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "adminBulkUpdateUsers" });
    }
}

export const POST = withAPIMiddleware(bulkUpdateUsers);

