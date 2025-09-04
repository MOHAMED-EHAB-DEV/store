import jwt from "jsonwebtoken";
import User from "./models/User";
import { cookies } from "next/headers";
import {connectToDatabase} from "./database";

// Server-side auth
export async function getUserFromServer({headerToken=""}:{headerToken:string}) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get("token");
        const token = headerToken || cookieToken?.value;

        if (!token) return null;

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT secret is not defined");

        const decoded = jwt.verify(token, secret);

        if (typeof decoded === "string" || !("id" in decoded)) {
            throw new Error("Invalid token payload");
        }
        
        const user = await User.findById(decoded.id).select(
            "_id name email avatar role"
        );
        if (!user) return null;
        const data = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
        };
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("Server auth error:", error);
        return null;
    }
}
