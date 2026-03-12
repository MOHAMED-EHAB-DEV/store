import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function logout(req: NextRequest) {
    try {
        await connectToDatabase();
        // Try to get the current user for logging purposes
        let user = null;
        try {
            user = await authenticateUser();
            if (user) {
                // Update last logout time
                await User.findByIdAndUpdate(user._id, {
                    lastLogout: new Date()
                });
            }
        } catch (authError) {
    if (authError && typeof authError === 'object' && 'digest' in authError) throw authError;
            // Don't fail logout if we can't authenticate
            console.warn('Authentication check failed during logout:', authError);
        }

        // Create response
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully"
        }, { status: 200 });

        // Clear the auth cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return response;

    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        // Fallback for logout - clear cookie even if DB fails
        const response = NextResponse.json({
            success: true,
            message: "Session cleared"
        }, { status: 200 });

        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return response;
    }
}

export const GET = withAPIMiddleware(logout);