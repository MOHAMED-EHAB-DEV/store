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
    console.log(`Error while authenticating user: ${error}`);
    return null;
  }
}
