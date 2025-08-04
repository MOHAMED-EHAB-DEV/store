import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase, measureQuery } from "@/lib/database";
import { UserService } from "@/lib/services/UserService";

// Types
interface RegisterRequest {
    name: string;
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

// Validation helpers
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name: string): boolean {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s\-']+$/.test(name);
}

function validateRegisterRequest(body: any): body is RegisterRequest {
    return (
        body &&
        typeof body.name === 'string' &&
        typeof body.email === 'string' &&
        typeof body.password === 'string' &&
        body.name.length > 0 &&
        body.email.length > 0 &&
        body.password.length > 0
    );
}

// Rate limiting for registration
const registrationAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRegistrationRateLimit(identifier: string, maxAttempts = 3, windowMs = 60 * 60 * 1000): boolean {
    const now = Date.now();
    const attempts = registrationAttempts.get(identifier);

    if (!attempts || now > attempts.resetTime) {
        registrationAttempts.set(identifier, { count: 1, resetTime: now + windowMs });
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

        if (!validateRegisterRequest(body)) {
            return NextResponse.json({
                success: false,
                message: "Invalid request. Name, email, and password are required."
            }, { status: 400 });
        }

        const { name, email, password } = body;

        // Normalize inputs
        const normalizedEmail = email.toLowerCase().trim();
        const trimmedName = name.trim();

        // Validate inputs
        if (!validateName(trimmedName)) {
            return NextResponse.json({
                success: false,
                message: "Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes."
            }, { status: 400 });
        }

        if (!validateEmail(normalizedEmail)) {
            return NextResponse.json({
                success: false,
                message: "Please provide a valid email address."
            }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({
                success: false,
                message: "Password must be at least 6 characters long."
            }, { status: 400 });
        }

        // Rate limiting by IP
        const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (!checkRegistrationRateLimit(clientIP)) {
            return NextResponse.json({
                success: false,
                message: "Too many registration attempts. Please try again later."
            }, { status: 429 });
        }

        // Connect to database
        await connectToDatabase();

        // Check if user already exists using UserService
        const existingUser = await UserService.findByEmail(normalizedEmail, {
            select: '_id email',
            lean: true
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "User already exists"
            }, { status: 409 });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 12);

        // Create user data
        const userData = {
            name: trimmedName,
            email: normalizedEmail,
            password: hashedPassword,
        };

        // Create user using UserService
        const newUser = await UserService.createUser(userData);

        // Validate JWT_SECRET
        const JWT_SECRET = process.env.JWT_SECRET! as string;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables.");
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
                avatar: newUser.avatar
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const duration = Date.now() - startTime;

        // Create response
        const response = NextResponse.json({
            message: "Registered successfully",
            user: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
            success: true,
            performance: {
                duration
            }
        }, { status: 200 });

        // Set authentication cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;

    } catch (error) {
        console.error('Registration error:', error);

        const duration = Date.now() - startTime;

        // Handle specific database errors
        let message = "Internal server error";
        let status = 500;

        if (error instanceof Error) {
            if (error.message.includes('duplicate key error') && error.message.includes('email')) {
                message = "User already exists";
                status = 409;
            }
        }

        return NextResponse.json({
            message,
            success: false,
            performance: {
                duration
            }
        }, { status });
    }
}