import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/database";
import { authenticateUser } from "@/lib/auth";
import User from "@/lib/models/User";
import { createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";

interface PasswordUpdateRequest {
    email: string;
    password: string;
    newPassword: string;
}

function validatePasswordUpdateRequest(body: any): body is PasswordUpdateRequest {
    return (
        body &&
        typeof body.email === 'string' &&
        typeof body.password === 'string' &&
        typeof body.newPassword === 'string' &&
        body.email.length > 0 &&
        body.password.length > 0 &&
        body.newPassword.length >= 8 // Minimum password length
    );
}

async function updatePassword(req: NextRequest) {
    try {
        const body = await req.json();
        
        if (!validatePasswordUpdateRequest(body)) {
            return createErrorResponse("Invalid request. current password, and new password (min 8 chars) are required.", 400, { req });
        }

        const { email, password, newPassword } = body;

        await connectToDatabase();
        const sessionUser = await authenticateUser();

        if (!sessionUser) {
            return createErrorResponse("Authentication required. Please log in.", 401, { req });
        }

        // Find user with password field included
        const dbUser = await User.findOne(
            { email },
            { password: 1, email: 1 }
        );

        if (!dbUser) {
            return createErrorResponse("User not found.", 404, { req });
        }

        // Security check: ensure user can only update their own password
        if (sessionUser.email !== dbUser?.email) {
            return createErrorResponse("Unauthorized. You can only update your own password.", 403, { req });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(password, dbUser?.password! as string);
        
        if (!isValidPassword) {
            return createErrorResponse("Current password is incorrect.", 401, { req });
        }

        // Additional security: prevent setting same password
        const isSamePassword = await bcrypt.compare(newPassword, dbUser.password! as string);
        if (isSamePassword) {
            return createErrorResponse("New password must be different from current password.", 400, { req });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        const updatedUser = await User.findByIdAndUpdate(
            String(dbUser?._id),
            { 
                password: hashedNewPassword,
                passwordUpdatedAt: new Date()
            }
        ).select("_id name email role avatar updatedAt").lean();

        return NextResponse.json({
            success: true,
            message: "Password updated successfully.",
            data: {
                user: updatedUser,
                updatedAt: new Date().toISOString(),
            }
        }, { status: 200 });

    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "updatePassword" });
    }
}

export const PATCH = withAPIMiddleware(updatePassword, {
    rateLimit: { maxRequests: 5, windowMs: 15 * 60 * 1000 }
});