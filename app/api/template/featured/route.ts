import { NextRequest } from "next/server";
import {
  createAPIResponse,
  withAPIMiddleware,
  createErrorResponse,
} from "@/lib/utils/api-helpers";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import Review from "@/lib/models/Review";

async function getFeaturedTemplates(req: NextRequest) {
  try {
    await connectToDatabase();

    const templates = await Template.find({
      categories: {
        $in: ["6895e37824be395fbc0b72ae"],
      },
      isActive: true,
    })
      .select(
        "_id title description thumbnail price tags categories averageRating",
      )
      .populate("categories", "name")
      .limit(4)
      .lean();

    const templateIds = templates.map((t) => t._id);

    const reviewCounts = await Review.aggregate([
      { $match: { template: { $in: templateIds } } },
      { $group: { _id: "$template", count: { $sum: 1 } } },
    ]);

    const reviewCountMap = new Map(
      reviewCounts.map((r) => [r._id.toString(), r.count]),
    );

    const templatesWithReviews = templates.map((template) => ({
      ...template,
      _id: template._id.toString(),
      reviews: reviewCountMap.get(template._id.toString()) ?? 0,
    }));

    return createAPIResponse(templatesWithReviews);
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getFeaturedTemplates",
    });
  }
}

export const GET = withAPIMiddleware(getFeaturedTemplates);
