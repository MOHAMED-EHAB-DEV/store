import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function setOffline(request: NextRequest) {
    try {
        await connectToDatabase();
        const user = await authenticateUser(false, true, true);

        if (!user) {
            return createErrorResponse("User not found", 404, { req: request });
        }

        await User.findByIdAndUpdate(user._id, { online: false, lastSeen: new Date() });

        return NextResponse.json({ success: true });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "setOffline" });
    }
}

export const POST = withAPIMiddleware(setOffline);