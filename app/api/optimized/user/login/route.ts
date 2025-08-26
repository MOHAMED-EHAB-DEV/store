import { NextRequest, NextResponse } from 'next/server';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/database-optimized";
import User from "@/lib/models/optimized/User";
import { 
    withAPIMiddleware, 
    createAPIResponse, 
    createErrorResponse,
    RateLimiter
} from '@/lib/utils/api-helpers';

// Enhanced types for better type safety
interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

interface LoginResponse {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        lastLogin: Date;
    };
    expiresIn: string;
}

// Comprehensive validation helper
function validateLoginRequest(body: any): { isValid: boolean; data?: LoginRequest; error?: string } {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body is required' };
    }

    const { email, password, rememberMe } = body;

    // Email validation
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    if (email.length > 254) {
        return { isValid: false, error: 'Email too long' };
    }

    // Password validation
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
        return { isValid: false, error: 'Password too short' };
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password too long' };
    }

    // RememberMe validation
    if (rememberMe !== undefined && typeof rememberMe !== 'boolean') {
        return { isValid: false, error: 'RememberMe must be boolean' };
    }

    return {
        isValid: true,
        data: {
            email: email.toLowerCase().trim(),
            password,
            rememberMe: rememberMe || false
        }
    };
}

// Enhanced rate limiting specifically for login attempts
function checkLoginRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    lockDuration?: number;
} {
    // More aggressive rate limiting for login
    // 5 attempts per 15 minutes per IP
    const ipLimit = RateLimiter.check(identifier, 5, 15 * 60 * 1000);
    
    if (!ipLimit.allowed) {
        return {
            allowed: false,
            remaining: ipLimit.remaining,
            resetTime: ipLimit.resetTime,
            lockDuration: 15 * 60 * 1000 // 15 minutes
        };
    }

    return ipLimit;
}

async function loginHandler(req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        // Parse and validate request body
        let body;
        try {
            body = await req.json();
        } catch (error) {
            return createErrorResponse('Invalid JSON in request body', 400);
        }

        const validation = validateLoginRequest(body);
        if (!validation.isValid) {
            return createErrorResponse(validation.error!, 400);
        }

        const { email, password, rememberMe } = validation.data!;

        // Enhanced rate limiting by IP and email
        const clientIP = req.headers.get('x-forwarded-for') || 
                        req.headers.get('x-real-ip') || 
                        req.headers.get('cf-connecting-ip') || 'unknown';
        
        const ipRateLimit = checkLoginRateLimit(clientIP);
        if (!ipRateLimit.allowed) {
            return createErrorResponse(
                `Too many login attempts. Try again in ${Math.ceil((ipRateLimit.resetTime - Date.now()) / 60000)} minutes.`,
                429,
                { 
                    resetTime: ipRateLimit.resetTime,
                    lockDuration: ipRateLimit.lockDuration
                }
            );
        }

        // Email-based rate limiting (3 attempts per email per 10 minutes)
        const emailRateLimit = RateLimiter.check(`email:${email}`, 3, 10 * 60 * 1000);
        if (!emailRateLimit.allowed) {
            return createErrorResponse(
                'Too many failed attempts for this email. Please try again later.',
                429,
                { resetTime: emailRateLimit.resetTime }
            );
        }

        // Connect to database
        await connectToDatabase();

        // Check for expired locks and clean them up
        await User.cleanupExpiredLocks();

        // Find user with password and security fields
        const user = await User.findByEmailWithPassword(email);

        if (!user) {
            // Consistent timing to prevent user enumeration
            await bcrypt.compare(password, '$2a$10$dummy.hash.to.prevent.timing.attacks');
            return createErrorResponse('Invalid email or password', 401);
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const lockTimeRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            return createErrorResponse(
                `Account temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
                423, // 423 Locked
                { lockUntil: user.lockUntil }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            // Increment failed login attempts
            await User.incrementLoginAttempts(user._id);
            
            return createErrorResponse('Invalid email or password', 401);
        }

        // Check if email is verified (if you have email verification)
        if (!user.isEmailVerified) {
            return createErrorResponse(
                'Please verify your email address before logging in',
                403,
                { needsEmailVerification: true }
            );
        }

        // Reset login attempts and update last login
        await User.resetLoginAttempts(user._id);

        // Generate JWT token with appropriate expiration
        const tokenExpiration = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET!,
            { expiresIn: tokenExpiration }
        );

        const duration = Date.now() - startTime;

        // Prepare response data
        const responseData: LoginResponse = {
            message: "Login successful",
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                lastLogin: new Date()
            },
            expiresIn: tokenExpiration
        };

        // Create response with secure cookie
        const response = createAPIResponse(responseData, {
            performance: { duration }
        });

        // Set secure HTTP-only cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
            path: "/",
        };

        response.cookies.set("token", token, cookieOptions);

        // Set security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');

        // Log successful login (for security monitoring)
        console.log(`✅ Successful login: ${email} from IP: ${clientIP}`);

        return response;

    } catch (error) {
        console.error('Login error:', error);
        
        // Security: Don't expose internal errors
        return createErrorResponse(
            'An unexpected error occurred. Please try again.',
            500
        );
    }
}

// Export with specialized middleware for login
export const POST = withAPIMiddleware(loginHandler, {
    // No caching for login (security)
    // Custom validation is handled inside the function for better control
});
