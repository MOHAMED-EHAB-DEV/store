import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils/api-helpers";
import { authenticateUser } from "@/middleware/auth";
import Template from "@/lib/models/Template";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();
    const user = await authenticateUser();

    if (!user)
      return NextResponse.json(
        { success: false, message: "No Session" },
        { status: 401 }
      );

    const dtUser = await User.findById(user._id).lean();
    if (!dtUser)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    if (dtUser.role !== "admin")
      return NextResponse.json(
        { success: false, message: "Invalid access, User isn't admin" },
        { status: 401 }
      );

    const created = await Template.create(body);

    return NextResponse.json({ success: true, data: created }, { status: 200 });
  } catch (err) {
    return handleApiError(err, req, {
      message: "Error creating template",
      operation: "createTemplate",
    });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const templates = await Template.find({});
    return NextResponse.json(
      { success: true, data: templates },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err, req as unknown as NextRequest, {
      message: "Error fetching templates",
      operation: "getTemplates",
    });
  }
}
