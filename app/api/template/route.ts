import { NextRequest, NextResponse } from "next/server";
import {
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { authenticateUser } from "@/middleware/auth";
import Template from "@/lib/models/Template";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";

async function createTemplate(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();
    const user = await authenticateUser();

    if (!user) {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const dbUser = await User.findById(user._id).lean();
    if (!dbUser) {
      return createErrorResponse("User not found", 404, { req });
    }

    if (dbUser.role !== "admin") {
      return createErrorResponse("Forbidden: Admin access only", 403, { req });
    }

    const created = await Template.create(body);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "createTemplate",
    });
  }
}

async function getTemplates(req: NextRequest) {
  try {
    await connectToDatabase();
    const templates = await Template.find({});
    return NextResponse.json(
      { success: true, data: templates },
      { status: 200 },
    );
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getTemplates",
    });
  }
}

export const GET = withAPIMiddleware(getTemplates);
export const POST = withAPIMiddleware(createTemplate);
