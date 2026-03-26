import { jwtVerify } from "jose";
import User from "./models/User";
import { cookies } from "next/headers";
// Verify JWT token and return decoded payload
export async function verifyToken(token: string): Promise<{ userId: string; role: string; banned?: boolean } | null> {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT secret is not defined");

        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

        if (!payload || !payload.id) {
            return null;
        }

        return {
            userId: payload.id as string,
            role: (payload.role as string) || "user",
            banned: payload.banned as boolean | undefined
        };
    } catch (error) {
        return null;
    }
}
// Server-side auth
export async function getUserFromServer({ headerToken = "" }: { headerToken: string }) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get("token");
        const token = headerToken || cookieToken?.value;

        if (!token) return null;

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT secret is not defined");

        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

        if (!payload || !payload.id) {
            throw new Error("Invalid token payload");
        }

        const user = await User.findById(payload.id).select(
            "_id name email avatar role online banned"
        );
        if (!user) return null;
        const data = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            online: user.online,
            banned: user.banned
        };
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("Server auth error:", error);
        return null;
    }
}
