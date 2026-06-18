import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { NextRequest } from "next/server";

async function getFAQs(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";

    let query = {};
    if (category !== "all") {
      query = { category };
    }

    const faqs = await FAQ.find({ ...query, isPublished: true })
      .select("_id question answer category order coverImage")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return createAPIResponse(faqs);
  } catch (error) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
    });
  }
}

export const GET = withAPIMiddleware(getFAQs);

