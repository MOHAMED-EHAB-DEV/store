"use server";

import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";

export async function authenticateUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) return;

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT secret is not defined");

        const decoded = jwt.verify(token.value, secret);

        if (typeof decoded === "string" || !("id" in decoded)) {
            throw new Error("Invalid token payload");
        }

        await connectToDatabase();

        const user = await User.findOne(
            { _id: decoded.id },
            { _id: 0 }
        ).lean();

        if (!user) throw new Error("User not found");

        return user;
    } catch (error) {
        console.log(`Error while authenticating user: ${error}`);
        return null;
    }
}
