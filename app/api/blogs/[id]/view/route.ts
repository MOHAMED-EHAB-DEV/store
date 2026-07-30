import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const user = await authenticateUser();
    if (user?.role !== "admin" || process.env.NODE_ENV === "production") {
      const query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { $or: [{ _id: id }, { slug: id }] }
        : { slug: id };

      await Blog.findOneAndUpdate(query, { $inc: { views: 1 } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to increment blog view:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
