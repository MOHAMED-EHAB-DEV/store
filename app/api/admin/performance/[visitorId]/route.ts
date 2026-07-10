import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Analytics from "@/lib/models/Analytics";
import Visitor from "@/lib/models/Visitor";
import { authenticateUser } from "@/middleware/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function getVisitorPerformance(
  req: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { visitorId } = await params;

    const [analyticsDocs, visitorInfo] = await Promise.all([
      Analytics.find({ visitorId }).sort({ createdAt: -1 }).lean(),
      Visitor.findOne({ visitorId }).populate("userId", "name email avatar").lean()
    ]);

    if (!analyticsDocs || analyticsDocs.length === 0) {
      return createErrorResponse("No performance data found for this visitor", 404, { req });
    }

    // Aggregate metrics for this visitor
    const metricsAcc: Record<string, { sum: number; count: number }> = {
      LCP: { sum: 0, count: 0 },
      INP: { sum: 0, count: 0 },
      CLS: { sum: 0, count: 0 },
      TTFB: { sum: 0, count: 0 }
    };

    const allPages: any[] = [];

    analyticsDocs.forEach((doc) => {
      doc.pages.forEach((page: any) => {
        const pageEntry = {
          date: doc.date,
          path: page.path,
          createdAt: doc.createdAt,
          metrics: page.metrics
        };
        allPages.push(pageEntry);

        page.metrics.forEach((m: any) => {
          if (metricsAcc[m.name]) {
            metricsAcc[m.name].sum += m.value;
            metricsAcc[m.name].count += 1;
          }
        });
      });
    });

    const averages = Object.keys(metricsAcc).map(name => {
      const { sum, count } = metricsAcc[name];
      return {
        name,
        average: count > 0 ? Number((sum / count).toFixed(2)) : 0,
        count
      };
    });

    return createAPIResponse({
      visitorId,
      visitorInfo,
      averages,
      pages: allPages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error: any) {
    return createErrorResponse("Failed to get visitor performance", 500, { req, error });
  }
}

export const GET = withAPIMiddleware(getVisitorPerformance);
