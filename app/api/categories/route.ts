import { NextRequest } from "next/server";
import { createAPIResponse, createErrorResponse } from "@/lib/utils/api-helpers";
import Category from "@/lib/models/Category";
import { connectToDatabase } from "@/lib/database";


export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const categories = await Category.find({
            isActive: true
        });
        return createAPIResponse(categories);
    } catch (error: any) {
        return createErrorResponse("Something went wrong", 500, {
            req: request,
            error: error,
            operation: "getCategories"
        });
    }
}