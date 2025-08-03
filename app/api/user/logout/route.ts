import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { UserService } from "@/lib/services/UserService";

interface ApiResponse {
    success: boolean;
    message: string;
    performance?: {
        duration: number;
    };
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        // Try to get the current user for logging purposes
        let user = null;
        try {
            user = await authenticateUser();
            if (user) {
                // Update last logout time
                await UserService.updateUser(user._id, {
                    lastLogout: new Date()
                });

                // Clear user cache
                UserService.clearUserCache(user._id);
            }
        } catch (authError) {
            // Don't fail logout if we can't authenticate
            console.warn('Authentication check failed during logout:', authError);
        }

        const duration = Date.now() - startTime;

        // Create response
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully",
            performance: {
                duration
            }
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

    } catch (error) {
        console.error("Logout error:", error);

        const duration = Date.now() - startTime;

        // Even if there's an error, we should still clear the cookie
        const response = NextResponse.json({
            success: true, // We consider this successful since we're clearing the session
            message: "Session cleared",
            performance: {
                duration
            }
        }, { status: 200 });

        // Clear the cookie regardless of errors
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