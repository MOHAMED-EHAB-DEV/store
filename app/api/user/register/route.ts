import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

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
    typeof body.name === "string" &&
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    body.name.length > 0 &&
    body.email.length > 0 &&
    body.password.length > 0
  );
}

async function registerHandler(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse and validate request body
    const body = await req.json();

    if (!validateRegisterRequest(body)) {
      return createErrorResponse("Invalid request. Name, email, and password are required.", 400, { req }) as any;
    }

    const { name, email, password } = body;

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    // Validate inputs
    if (!validateName(trimmedName)) {
      return createErrorResponse("Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes.", 400, { req }) as any;
    }

    if (!validateEmail(normalizedEmail)) {
      return createErrorResponse("Please provide a valid email address.", 400, { req }) as any;
    }

    if (password.length < 6) {
      return createErrorResponse("Password must be at least 6 characters long.", 400, { req }) as any;
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
      .select("_id email")
      .lean();

    if (existingUser) {
      return createErrorResponse("User already exists", 409, { req }) as any;
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 12);

    // Create user data
    const userData = {
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    };

    // Create User
    const newUser = await User.create(userData);

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
        avatar: newUser.avatar,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json(
      {
        message: "Registered successfully",
        user: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        success: true,
      },
      { status: 200 }
    );

    // Set authentication cookie
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return handleApiError(error, req, { operation: "userRegister" }) as any;
  }
}

export const POST = withAPIMiddleware(registerHandler, {
  rateLimit: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000
  }
});

