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

    const templatesWithReviews = await Promise.all(
      templates.map(async (template) => {
        const id = template?._id;

        const reviews = await Review.countDocuments({ template: id });

        return {
          ...template,
          reviews: reviews ?? 0,
        };
      }),
    );

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
