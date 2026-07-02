import { NextRequest, NextResponse } from "next/server";
import {
  withAPIMiddleware,
  createErrorResponse,
} from "@/lib/utils/api-helpers";
import { SignJWT } from "jose";
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
}

// Validation helper
function validateLoginRequest(body: any): body is LoginRequest {
  return (
    body &&
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    body.email.length > 0 &&
    body.password.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) // Basic email validation
  );
}

async function loginHandler(
  req: NextRequest,
) {
  try {
    // Parse and validate request body
    const body = await req.json();

    if (!validateLoginRequest(body)) {
      return createErrorResponse(
        "Invalid request. Valid email and password are required.",
        400,
        { req },
      ) as any;
    }

    const { email, password } = body;
    const normalizedEmail = email.toLowerCase().trim();

    // Connect to database
    await connectToDatabase();

    // Find user with password and lock status
    const user = await User.findOne(
      { email: normalizedEmail },
      {
        password: 1,
        name: 1,
        email: 1,
        role: 1,
        avatar: 1,
        lockUntil: 1,
        loginAttempts: 1,
        banned: 1,
      },
    );

    if (!user) {
      return createErrorResponse("User not Found", 401, { req }) as any;
    }

    if (user.banned) {
      return createErrorResponse("Your account has been banned", 403, {
        req,
      }) as any;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      // Auto ban if they keep trying while locked? (Original behavior)
      await User.findByIdAndUpdate(user?._id, {
        banned: true,
        banId: Math.random().toString(36).substring(2, 15).toUpperCase(),
      });
      const unlockTime = new Date(user.lockUntil).toLocaleTimeString();
      return createErrorResponse(
        `Account is temporarily locked due to multiple failed login attempts. Please try again after ${unlockTime}.`,
        423,
        { req },
      ) as any;
    }

    // Verify password
    const validPassword = await bcrypt.compare(
      password,
      user?.password! as string,
    );

    if (!validPassword && process.env.NODE_ENV === "production") {
      // Increment login attempts using the model method
      await User.findByIdAndUpdate(user?._id, {
        $inc: { loginAttempts: 1 },
      });

      // Check if we need to lock the account (5 failed attempts)
      const updatedUser = await User.findById(user?._id).select("loginAttempts");
      if (updatedUser && updatedUser.loginAttempts >= 5) {
        await User.findByIdAndUpdate(user?._id, {
          lockUntil: new Date(Date.now() + 15 * 60 * 1000), // Lock for 15 minutes
        });
        return createErrorResponse(
          "Account locked due to multiple failed login attempts. Please try again in 15 minutes.",
          423,
          { req },
        ) as any;
      }

      return createErrorResponse("Invalid Password", 401, { req }) as any;
    }

    // Validate JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET! as string;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      id: String(user?._id),
      email: user.email,
      avatar: user.avatar,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Update last login and reset login attempts
    await User.findByIdAndUpdate(String(user?._id), {
      lastLogin: new Date(),
      $unset: { loginAttempts: 1, lockUntil: 1 }, // Reset failed attempts and unlock
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        success: true,
      },
      { status: 200 },
    );

    // Set secure cookie
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
    });
  }
}

export const POST = withAPIMiddleware(loginHandler, {
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  },
});
