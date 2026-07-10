import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import {
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function getPurchasedTemplates(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(false, true);
    if (!user) {
      return createErrorResponse("Unauthorized access", 401, { req });
    }

    const dbUser = await User.findById(user?._id).select("purchasedTemplates");
    if (!dbUser) {
      return createErrorResponse("User not found", 404, { req });
    }

    return NextResponse.json(
      {
        success: true,
        data: dbUser.purchasedTemplates,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getPurchasedTemplates",
    });
  }
}

export const GET = withAPIMiddleware(getPurchasedTemplates);
