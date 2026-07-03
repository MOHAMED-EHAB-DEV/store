import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import Blog from "@/lib/models/Blog";
import { connectToDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "failed" });
  }
}
