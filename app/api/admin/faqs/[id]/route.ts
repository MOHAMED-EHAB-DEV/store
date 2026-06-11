import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, withAPIMiddleware, createAPIResponse, validatePagination } from "@/lib/utils/api-helpers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/faqs/[id] - Get single FAQ
async function getAdminFAQ(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;
        await connectToDatabase();

        const faq = await FAQ.findById(id).lean();

        if (!faq) {
            return createErrorResponse("FAQ not found", 404, { req: request });
        }

        return createAPIResponse(faq);
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return createErrorResponse("Something went wrong", 500, { req: request, error: error, operation: "adminGetFAQ" });
    }
}

// PUT /api/admin/faqs/[id] - Update FAQ
async function updateAdminFAQ(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;
        await connectToDatabase();

        const body = await request.json();
        const { question, answer, category, order, isPublished, coverImage } = body;

        const faq = await FAQ.findByIdAndUpdate(
            id,
            {
                ...(question && { question }),
                ...(answer && { answer }),
                ...(category && { category }),
                ...(order !== undefined && { order }),
                ...(isPublished !== undefined && { isPublished }),
                ...(coverImage !== undefined && { coverImage }),
            },
            { new: true, runValidators: true }
        ).lean();

        if (!faq) {
            return createErrorResponse("FAQ not found", 404, { req: request });
        }

        return createAPIResponse(faq, { message: "FAQ updated successfully" });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return createErrorResponse("Something went wrong", 500, { req: request, error: error, operation: "adminUpdateFAQ" });
    }
}

// DELETE /api/admin/faqs/[id] - Delete FAQ
async function deleteAdminFAQ(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;
        await connectToDatabase();

        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
            return createErrorResponse("FAQ not found", 404, { req: request });
        }

        return createAPIResponse(null, {
            message: "FAQ deleted successfully",
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return createErrorResponse("Something went wrong", 500, { req: request, error: error, operation: "adminDeleteFAQ" });
    }
}

export const GET = withAPIMiddleware(getAdminFAQ);
export const PUT = withAPIMiddleware(updateAdminFAQ);
export const DELETE = withAPIMiddleware(deleteAdminFAQ);

