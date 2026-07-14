import { NextRequest } from "next/server";
import {
  createAPIResponse,
  withAPIMiddleware,
  createErrorResponse,
} from "@/lib/utils/api-helpers";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";

async function getFeaturedTemplates(req: NextRequest) {
  try {
    await connectToDatabase();

    const templates = await Template.find({
      isActive: true,
      tags: {
        $in: ["featured"],
      },
    })
      .select(
        "_id slug title description thumbnail price demoVideo tags categories averageRating reviewCount",
      )
      .populate("categories", "name slug")
      .limit(4)
      .lean();

    const result = templates.map((template) => ({
      ...template,
      _id: template._id.toString(),
      reviews: template.reviewCount ?? 0,
    }));

    return createAPIResponse(result);
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getFeaturedTemplates",
    });
  }
}

export const GET = withAPIMiddleware(getFeaturedTemplates, {
  cache: { ttl: 120 * 1000 },
});
