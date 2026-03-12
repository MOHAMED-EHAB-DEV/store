import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";
import { updateTag } from "next/cache";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function deleteAdminTemplate(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        const { id } = await params;
        await connectToDatabase();

        const template = await Template.findByIdAndDelete(id);

        if (!template) {
            return createErrorResponse("Template not found", 404, { req });
        }

        return NextResponse.json({
            message: "Template deleted successfully",
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "adminDeleteTemplate" });
    }
}

async function updateAdminTemplate(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        const { id } = await params;
        await connectToDatabase();

        const body = await req.json();

        const template = await Template.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!template) {
            return createErrorResponse("Template not found", 404, { req });
        }

        updateTag(`template-${id}`);

        return NextResponse.json({
            message: "Template updated successfully",
            data: template,
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "adminUpdateTemplate" });
    }
}

export const DELETE = withAPIMiddleware(deleteAdminTemplate);
export const PATCH = withAPIMiddleware(updateAdminTemplate);

