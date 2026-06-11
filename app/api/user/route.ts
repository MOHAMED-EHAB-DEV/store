import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getUserFromServer } from "@/lib/auth";
import { withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getUser(request: NextRequest) {
    try {
        await connectToDatabase();
        // Get token from Authorization header or cookie (handled by getUserFromServer)
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        const user = await getUserFromServer({ headerToken: headerToken as string });
        return NextResponse.json({ user });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return createErrorResponse("Something went wrong", 500, { req: request, error: error, operation: "getCurrentUser" });
    }
}

export const GET = withAPIMiddleware(getUser);

