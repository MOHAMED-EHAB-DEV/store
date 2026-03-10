import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError } from "@/lib/utils/api-helpers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/faqs/[id] - Get single FAQ
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;
        await connectToDatabase();

        const faq = await FAQ.findById(id).lean();

        if (!faq) {
            return createErrorResponse("FAQ not found", 404, { req: request, operation: "adminGetFAQ" });
        }

        return NextResponse.json({ success: true, data: faq });
    } catch (error: any) {
        return handleApiError(error, request, { operation: "adminGetFAQ" });
    }
}

// PUT /api/admin/faqs/[id] - Update FAQ
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
            return createErrorResponse("FAQ not found", 404, { req: request, operation: "adminUpdateFAQ" });
        }

        return NextResponse.json({
            success: true,
            data: faq,
            message: "FAQ updated successfully",
        });
    } catch (error: any) {
        return handleApiError(error, request, { operation: "adminUpdateFAQ" });
    }
}

// DELETE /api/admin/faqs/[id] - Delete FAQ
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;
        await connectToDatabase();

        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
            return createErrorResponse("FAQ not found", 404, { req: request, operation: "adminDeleteFAQ" });
        }

        return NextResponse.json({
            success: true,
            message: "FAQ deleted successfully",
        });
    } catch (error: any) {
        return handleApiError(error, request, { operation: "adminDeleteFAQ" });
    }
}
