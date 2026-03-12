import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

async function unbanUser(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await authenticateUser(true, true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;

        await connectToDatabase();
        const dbUser = await User.findById(id);

        if (!dbUser) {
            return createErrorResponse("User not found", 404, { req: request });
        }

        // Clear ban and metadata
        dbUser.banned = false;
        dbUser.banId = "";
        dbUser.banMetadata = undefined;

        await dbUser.save();

        return NextResponse.json({
            success: true,
            message: "User unbanned successfully"
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "unbanUser" });
    }
}

export const POST = withAPIMiddleware(unbanUser);