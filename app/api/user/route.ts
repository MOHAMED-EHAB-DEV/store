import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getUserFromServer } from "@/lib/auth";
import {
  withAPIMiddleware,
  createErrorResponse,
} from "@/lib/utils/api-helpers";

async function getUser(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await getUserFromServer({
      headerToken: request.headers.get("Authorization")?.split(" ")[1],
    });
    return NextResponse.json({ user });
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error: error,
      operation: "getCurrentUser",
    });
  }
}

export const GET = withAPIMiddleware(getUser);
