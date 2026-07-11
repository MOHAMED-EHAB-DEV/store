import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import Template from "@/lib/models/Template";

export async function GET(req: NextRequest) {
    await connectToDatabase();
    await Template.findByIdAndUpdate(
        "6a492eb5c8bfd3e6d933e114",
        {
            $set: {
                demoVideo: "https://res.cloudinary.com/ju8d58lo/video/upload/v1783720729/2026-07-11_00-33-08_j9gtqi.mp4"
            }
        }
    )
    return NextResponse.json({ message: "success" });
}