import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import { UserService } from "@/lib/services/UserService";
import User from "@/lib/models/User";

interface PasswordUpdateRequest {
    email: string;
    password: string;
    newPassword: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    performance?: {
        duration: number;
    };
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

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const userLimit = rateLimitMap.get(identifier);
    
    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (userLimit.count >= maxAttempts) {
        return false;
    }
    
    userLimit.count++;
    return true;
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();
    
    try {
        const body = await req.json();
        
        if (!validatePasswordUpdateRequest(body)) {
            return NextResponse.json({
                success: false,
                message: "Invalid request. current password, and new password (min 8 chars) are required."
            }, { status: 400 });
        }

        const { email, password, newPassword } = body;

        // Rate limiting by email (5 attempts per 15 minutes)
        if (!checkRateLimit(email, 5, 15 * 60 * 1000)) {
            return NextResponse.json({
                success: false,
                message: "Too many password update attempts. Please try again later."
            }, { status: 429 });
        }

        await connectToDatabase();
        const sessionUser = await authenticateUser();

        if (!sessionUser) {
            return NextResponse.json({
                success: false,
                message: "Authentication required. Please log in."
            }, { status: 401 });
        }

        // Find user with password field included using UserService
        const dbUser = await User.findOne(
            { email },
            { password: 1, email: 1 }
        );

        if (!dbUser) {
            return NextResponse.json({
                success: false,
                message: "User not found."
            }, { status: 404 });
        }

        // Security check: ensure user can only update their own password
        if (sessionUser.email !== dbUser?.email) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized. You can only update your own password."
            }, { status: 403 });
        }

        // Verify current password (use await for proper error handling)
        const isValidPassword = await bcrypt.compare(password, dbUser?.password! as string);
        
        if (!isValidPassword) {
            return NextResponse.json({
                success: false,
                message: "Current password is incorrect."
            }, { status: 401 });
        }

        // Additional security: prevent setting same password
        const isSamePassword = await bcrypt.compare(newPassword, dbUser.password! as string);
        if (isSamePassword) {
            return NextResponse.json({
                success: false,
                message: "New password must be different from current password."
            }, { status: 400 });
        }

        // Hash new password with optimal salt rounds for performance
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password using UserService
        const updatedUser = await UserService.updateUser(
            dbUser._id.toString(),
            { 
                password: hashedNewPassword,
                passwordUpdatedAt: new Date()
            },
            {
                select: '_id name email role avatar updatedAt'
            }
        );

        const duration = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            message: "Password updated successfully.",
            data: {
                user: updatedUser,
                updatedAt: new Date().toISOString(),
            },
            performance: {
                duration
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Password update error:', error);
        
        const duration = Date.now() - startTime;
        
        // Don't expose internal errors in production
        const message = process.env.NODE_ENV === 'development' 
            ? `Internal error: ${(error as Error).message}`
            : "An unexpected error occurred. Please try again.";

        return NextResponse.json({
            success: false,
            message,
            performance: {
                duration
            }
        }, { status: 500 });
    }
}