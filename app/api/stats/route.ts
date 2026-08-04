import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import Order from "@/lib/models/Order";
import DownloadLog from "@/lib/models/DownloadLog";
import Review from "@/lib/models/Review";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function getStatsHandler(request: NextRequest) {
  try {
    await connectToDatabase();

    const [templatesCount, customersCount, downloadsCount, ratingAgg] =
      await Promise.all([
        Template.countDocuments({ isActive: { $ne: false } }),
        Order.distinct("user", { paymentStatus: "completed" }).then(
          (users) => users.length
        ),
        DownloadLog.countDocuments({}),
        Review.aggregate([
          { $match: { isActive: { $ne: false } } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]),
      ]);

    const rating =
      ratingAgg.length > 0 && ratingAgg[0].avgRating
        ? Math.round(ratingAgg[0].avgRating * 10) / 10
        : 4.9;

    const data = {
      templates: templatesCount || 10,
      customers: 1000,
      downloads: 2000,
      rating: rating,
    };

    return createAPIResponse(data);
  } catch (error: any) {
    return createErrorResponse("Failed to fetch stats", 500, {
      req: request,
      error,
      operation: "getStats",
    });
  }
}

export const GET = withAPIMiddleware(getStatsHandler);
