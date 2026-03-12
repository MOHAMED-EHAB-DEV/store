import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import User from "@/lib/models/User";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function updatePreferences(req: NextRequest) {
    try {
        const body = await req.json();
        const { emailNotifications, marketingEmails, weeklyDigest } = body;

        await connectToDatabase();
        const currentUser = await authenticateUser();

        if (!currentUser) {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        const updatedUser = await User.findByIdAndUpdate(
            currentUser._id,
            {
                $set: {
                    "preferences.emailNotifications": emailNotifications ?? true,
                    "preferences.marketingEmails": marketingEmails ?? false,
                    "preferences.weeklyDigest": weeklyDigest ?? true,
                },
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return createErrorResponse("User not found", 404, { req });
        }

        return NextResponse.json({
            success: true,
            message: "Preferences updated successfully",
            data: updatedUser,
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "updatePreferences" });
    }
}

export const PATCH = withAPIMiddleware(updatePreferences);

