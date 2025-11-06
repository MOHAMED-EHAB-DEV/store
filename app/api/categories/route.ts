import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().lean();
    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (err) {
    console.log(`Error while fetching categories: ${err}`);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
