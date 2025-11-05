"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";
import { IUser } from "@/types";

export async function authenticateUser(connectDB:Boolean=false, isId:Boolean=false) {
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

        if(connectDB) await connectToDatabase();
        const user = await User.findOne(
            { _id: decoded.id },
            { _id: isId ? 1 : 0 }
        );

        if (!user) throw new Error("User not found");

        return user as IUser;
    } catch (error) {
        console.log(`Error while authenticating user: ${error}`);
        return null;
    }
}
