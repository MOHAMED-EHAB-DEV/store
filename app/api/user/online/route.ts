import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function setOnline(request: NextRequest) {
    try {
        await connectToDatabase();
        const user = await authenticateUser(false, true, true);

        if (!user) {
            return createErrorResponse("User not found", 404, { req: request });
        }

        await User.findByIdAndUpdate(user._id, { online: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return createErrorResponse("Something went wrong", 500, { req: request, error: error, operation: "setOnline" });
    }
}

export const POST = withAPIMiddleware(setOnline);