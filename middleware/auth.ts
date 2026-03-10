import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";
import { IUser } from "@/types";

export async function authenticateUser(
  connectDB: boolean = false,
  includeId: boolean = false,
  includePurchasedTemplates: boolean = false,
): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) throw new Error("Token is not defined");

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret is not defined");

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !("id" in decoded)) {
      throw new Error("Invalid token payload");
    }

    if (connectDB) await connectToDatabase();

    let selection =
      "name email role avatar googleId isEmailVerified tier online lastSeen createdAt updatedAt lastLogin loginAttempts lockUntil";
    if (includePurchasedTemplates) selection += " purchasedTemplates";
    if (includeId) selection += " _id";

    const user = await User.findOne({ _id: decoded.id }).select(selection);

    if (!user) {
      return null;
    }

    return user as IUser;
  } catch (error) {
    console.log(`Error while authenticating user: ${error}`);
    return null;
  }
}
