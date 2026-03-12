import { NextRequest, NextResponse } from "next/server";
import Template from "@/lib/models/Template";
import { handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";
import { connectToDatabase } from "@/lib/database";

async function getTemplateStats(req: NextRequest) {
  try {
    await connectToDatabase();
    const stats = await Template.getTemplateStats();
    return NextResponse.json(stats[0] || {});
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return handleApiError(error, req, { operation: "getTemplateStats" });
  }
}

export const GET = withAPIMiddleware(getTemplateStats);

