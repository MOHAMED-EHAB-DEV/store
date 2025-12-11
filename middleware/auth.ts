"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";
import { IUser } from "@/types";

export async function authenticateUser(connectDB: Boolean = false, includeId: Boolean = false, lean: Boolean = false): Promise<IUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) return null;

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT secret is not defined");

        const decoded = jwt.verify(token.value, secret);

        if (typeof decoded === "string" || !("id" in decoded)) {
            throw new Error("Invalid token payload");
        }

        if (connectDB) await connectToDatabase();

        const query = User.findOne(
            { _id: decoded.id },
            { _id: includeId ? 1 : 0 }
        );

        const user = lean ? await query.lean() : await query;

        if (!user) return null;

        return user as IUser;
    } catch (error) {
        console.log(`Error while authenticating user: ${error}`);
        return null;
    }
}
