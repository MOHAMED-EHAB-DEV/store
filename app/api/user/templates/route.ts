import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import DownloadLog from "@/lib/models/DownloadLog";
import { authenticateUser } from "@/lib/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import User from "@/lib/models/User";

async function getUserTemplates(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(false, false, true);
    if (!user) {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const idsOnly = searchParams.get("idsOnly") === "true";

    if (idsOnly) {
      const dbUser = await User.findById(user._id).select("purchasedTemplates");
      return NextResponse.json({
        success: true,
        data: dbUser?.purchasedTemplates || [],
      });
    }

    // Get user's purchased templates
    const templates = await Template.find({
      _id: { $in: user.purchasedTemplates || [] },
    })
      .populate("categories", "name slug")
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Get last download time for each template
    const downloadLogs = await DownloadLog.aggregate([
      { 
        $match: { 
          userId: user._id, 
          templateId: { $in: user.purchasedTemplates || [] }, 
          status: "success" 
        } 
      },
      { 
        $group: { 
          _id: "$templateId", 
          lastDownloadedAt: { $max: "$createdAt" } 
        } 
      }
    ]);

    const downloadLogMap = downloadLogs.reduce((acc: any, log: any) => {
      acc[log._id.toString()] = log.lastDownloadedAt;
      return acc;
    }, {});

    const templatesWithDownloadData = templates.map((t: any) => ({
      ...t,
      downloadedAt: downloadLogMap[t._id.toString()] || null,
    }));

    return NextResponse.json({
      message: "Templates fetched successfully",
      data: templatesWithDownloadData,
    });
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "getUserTemplates",
    });
  }
}

export const GET = withAPIMiddleware(getUserTemplates);
