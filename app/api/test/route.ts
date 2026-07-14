import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import Template from "@/lib/models/Template";
import Ticket from "@/lib/models/Ticket";
import Review from "@/lib/models/Review";

export async function GET(req: NextRequest) {
    // await connectToDatabase();
    return NextResponse.json({ message: "success" });
}