import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getUserFromServer } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        const user = await getUserFromServer({headerToken: headerToken as string});
        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}
