import { NextRequest, NextResponse } from "next/server";
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
    console.error("Error creating template:", err);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
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
    console.error("Error fetching templates:", err);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
