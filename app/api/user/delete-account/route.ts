import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {connectToDatabase} from "@/lib/database";
import User from "@/lib/models/User";

// Types for better type safety
interface DeletingRequest {
    email: string;
    password: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    performance?: {
        duration: number;
    };
}

// Validation helper
function validateLoginRequest(body: any): body is DeletingRequest {
    return (
        body &&
        typeof body.email === 'string' &&
        typeof body.password === 'string' &&
        body.email.length > 0 &&
        body.password.length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
    );
}

// Rate limiting for login attempts
const DeletingAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempts = DeletingAttempts.get(identifier);

    if (!attempts || now > attempts.resetTime) {
        DeletingAttempts.set(identifier, {count: 1, resetTime: now + windowMs});
        return true;
    }

    if (attempts.count >= maxAttempts) {
        return false;
    }

    attempts.count++;
    return true;
}

export async function DELETE(req: Request): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        // Parse and validate request body
        const body = await req.json();

        if (!validateLoginRequest(body)) {
            return NextResponse.json({
                success: false,
                message: "Invalid request. Valid email and password are required."
            }, {status: 400});
        }

        const {email, password} = body;
        const normalizedEmail = email.toLowerCase().trim();

        // Rate limiting by IP
        const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(clientIP)) {
            return NextResponse.json({
                success: false,
                message: "Too many deleting attempts. Please try again in 15 minutes."
            }, {status: 429});
        }

        // Connect to database
        await connectToDatabase();

        // Find user with password
        const user = await User.findOne(
            {email: normalizedEmail},
            { password: 1, email: 1 }
        );

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not Found"
            }, {status: 401});
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user?.password! as string);

        if (!validPassword) {
            return NextResponse.json({
                success: false,
                message: "Invalid Password"
            }, {status: 401});
        }

        // Delete User
        await User.findByIdAndDelete(user._id.toString());

        const duration = Date.now() - startTime;

        const response = NextResponse.json({
            message: "Deleted Successfully",
            success: true,
            performance: {
                duration
            }
        }, {status: 200});

        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return response;
    } catch (error) {
        console.error('Delete error:', error);

        const duration = Date.now() - startTime;

        return NextResponse.json({
            success: false,
            message: "Internal server error",
            performance: {
                duration
            }
        }, {status: 500});
    }
}