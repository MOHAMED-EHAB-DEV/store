import { NextRequest, NextResponse } from "next/server";
import { TemplateService } from "@/lib/services/TemplateService";
import { connectToDatabase } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    const templates = await TemplateService.getPopularTemplates(limit, skip);
    return NextResponse.json(
      { success: true, data: templates },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching popular templates:", err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}