import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";

export async function GET(req: NextRequest) {
    await connectToDatabase();

    return NextResponse.json({ message: "success" });
}