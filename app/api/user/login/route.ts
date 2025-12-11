import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";

// Types for better type safety
interface LoginRequest {
    email: string;
    password: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    user?: {
        name: string;
        email: string;
        role: string;
    };
    performance?: {
        duration: number;
    };
}

// Validation helper
function validateLoginRequest(body: any): body is LoginRequest {
    return (
        body &&
        typeof body.email === 'string' &&
        typeof body.password === 'string' &&
        body.email.length > 0 &&
        body.password.length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) // Basic email validation
    );
}

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier);

    if (!attempts || now > attempts.resetTime) {
        loginAttempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (attempts.count >= maxAttempts) {
        return false;
    }

    attempts.count++;
    return true;
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
    const startTime = Date.now();

    try {
        // Parse and validate request body
        const body = await req.json();

        if (!validateLoginRequest(body)) {
            return NextResponse.json({
                success: false,
                message: "Invalid request. Valid email and password are required."
            }, { status: 400 });
        }

        const { email, password } = body;
        const normalizedEmail = email.toLowerCase().trim();

        // Rate limiting by IP
        const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(clientIP)) {
            return NextResponse.json({
                success: false,
                message: "Too many login attempts. Please try again in 15 minutes."
            }, { status: 429 });
        }

        // Connect to database
        await connectToDatabase();

        // Find user with password and lock status
        const user = await User.findOne(
            { email: normalizedEmail },
            { password: 1, name: 1, email: 1, role: 1, avatar: 1, lockUntil: 1, loginAttempts: 1, banned: 1 }
        );

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not Found"
            }, { status: 401 });
        }

        if (user.banned) {
            return NextResponse.json({
                success: false,
                message: "Your account has been banned"
            }, { status: 403 });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            await User.findByIdAndUpdate(user._id, {
                banned: true,
                banId: Math.random().toString(36).substring(2, 15).toUpperCase(),
            });
            const unlockTime = new Date(user.lockUntil).toLocaleTimeString();
            return NextResponse.json({
                success: false,
                message: `Account is temporarily locked due to multiple failed login attempts. Please try again after ${unlockTime}.`
            }, { status: 423 }); // 423 Locked
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user?.password! as string);

        if (!validPassword) {
            // Increment login attempts using the model method
            await User.findByIdAndUpdate(user._id, {
                $inc: { loginAttempts: 1 }
            });

            // Check if we need to lock the account (5 failed attempts)
            const updatedUser = await User.findById(user._id).select('loginAttempts');
            if (updatedUser && updatedUser.loginAttempts >= 5) {
                await User.findByIdAndUpdate(user._id, {
                    lockUntil: new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
                });
                return NextResponse.json({
                    success: false,
                    message: "Account locked due to multiple failed login attempts. Please try again in 15 minutes."
                }, { status: 423 });
            }

            return NextResponse.json({
                success: false,
                message: "Invalid Password"
            }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            },
            process.env.JWT_SECRET! as string,
            { expiresIn: "7d" }
        );

        // Update last login and reset login attempts
        await User.findByIdAndUpdate(user._id.toString(), {
            lastLogin: new Date(),
            $unset: { loginAttempts: 1, lockUntil: 1 } // Reset failed attempts and unlock
        });

        const duration = Date.now() - startTime;

        // Create response
        const response = NextResponse.json({
            message: "Login successful",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
            success: true,
            performance: {
                duration
            }
        }, { status: 200 });

        // Set secure cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);

        const duration = Date.now() - startTime;

        return NextResponse.json({
            success: false,
            message: "Internal server error",
            performance: {
                duration
            }
        }, { status: 500 });
    }
}