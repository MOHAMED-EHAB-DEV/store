import { NextRequest, NextResponse } from "next/server";
import Template from "@/lib/models/Template";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getTemplatesByCategory(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = parseInt(searchParams.get('skip') || '0');

        if (!categoryId) {
            return createErrorResponse('Missing categoryId', 400, { req });
        }

        const templates = await Template.findByCategory(categoryId, limit, skip);
        return NextResponse.json(templates);
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "getTemplatesByCategory" });
    }
}

export const GET = withAPIMiddleware(getTemplatesByCategory);

