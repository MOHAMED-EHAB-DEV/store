import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import {
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

// Types for better type safety
interface DeletingRequest {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

// Validation helper
function validateDeleteRequest(body: any): body is DeletingRequest {
  return (
    body &&
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    body.email.length > 0 &&
    body.password.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  );
}

async function deleteAccountHandler(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();

    if (!validateDeleteRequest(body)) {
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

    // Find user with password
    const user = await User.findOne(
      { email: normalizedEmail },
      { password: 1, email: 1 },
    );

    if (!user) {
      return createErrorResponse("User not Found", 401, { req }) as any;
    }

    // Verify password
    const validPassword = await bcrypt.compare(
      password,
      user?.password! as string,
    );

    if (!validPassword) {
      return createErrorResponse("Invalid Password", 401, { req }) as any;
    }

    // Delete User
    await User.findByIdAndDelete((user as any)?._id.toString());

    const response = NextResponse.json(
      {
        message: "Deleted Successfully",
        success: true,
      },
      { status: 200 },
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
    });
  }
}

export const DELETE = withAPIMiddleware(deleteAccountHandler, {
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  },
});
