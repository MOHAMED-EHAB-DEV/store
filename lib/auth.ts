import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";
import { IUser } from "@/types";

export async function authenticateUser(
  connectDB: boolean = false,
  includeId: boolean = false,
  includePurchasedTemplates: boolean = false,
  lean: boolean = false,
): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) throw new Error("Token is not defined");

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload === "string" || !("id" in payload)) {
      throw new Error("Invalid token payload");
    }

    if (connectDB) await connectToDatabase();

    let selection =
      "name email role avatar isEmailVerified banned tier online lastSeen createdAt updatedAt lastLogin loginAttempts lockUntil";
    if (includePurchasedTemplates) selection += " purchasedTemplates";
    if (includeId) selection += " _id";

    const query = User.findOne({ _id: payload.id }).select(selection);
    const user = lean ? await query.lean() : await query;

    if (!user) {
      return null;
    }

    return JSON.parse(JSON.stringify(user)) as IUser;
  } catch (error: any) {
    // Re-throw Next.js internal errors (prerender bail-outs, redirects, notFound, etc.)
    // These carry a `digest` property that the framework relies on to detect dynamic pages.
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    // console.error(`Error while authenticating user: ${error}`);
    return null;
  }
}

// Verify JWT token and return decoded payload
export async function verifyToken(
  token: string,
): Promise<{ userId: string; role: string; banned?: boolean } | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret is not defined");

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    if (!payload || !payload.id) {
      return null;
    }

    return {
      userId: payload.id as string,
      role: (payload.role as string) || "user",
      banned: payload.banned as boolean | undefined,
    };
  } catch (error) {
    return null;
  }
}

// Server-side auth
export async function getUserFromServer({
  headerToken = "",
}: { headerToken?: string } = {}) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token");
    const token = headerToken || cookieToken?.value;

    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret is not defined");

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    if (!payload || !payload.id) {
      throw new Error("Invalid token payload");
    }

    const user = await User.findById(payload.id).select(
      "_id name email avatar role online banned",
    );
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    // console.error("Server auth error:", error);
    return null;
  }
}
