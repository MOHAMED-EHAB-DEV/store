// app/api/free/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import DownloadLog from "@/lib/models/DownloadLog";
import { utapi } from "@/lib/uploadthing";
import {
    withAPIMiddleware,
    createErrorResponse,
} from "@/lib/utils/api-helpers";
import { userHasPurchased } from "@/lib/payments";
import { authenticateUser } from "@/middleware/auth";
import { sanitizeFilename } from "@/lib/utils";

/** Validate query params */
function validateDownloadParams(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get("templateId")?.trim() || "";
        const token = searchParams.get("token")?.trim() || undefined;
        if (!templateId) return { isValid: false, error: "Missing templateId parameter" };
        if (!mongoose.Types.ObjectId.isValid(templateId)) return { isValid: false, error: "Invalid templateId format" };
        return { isValid: true, params: { templateId, token } };
    } catch {
        return { isValid: false, error: "Invalid request parameters" };
    }
}

async function downloadHandler(req: NextRequest): Promise<NextResponse> {
    try {
        // Validate params
        const validation = validateDownloadParams(req);
        if (!validation.isValid) return createErrorResponse(validation.error!, 400);
        const { templateId, token } = validation.params;


        // Connect DB
        await connectToDatabase();

        // Authenticate the requester (required for all downloads)
        // authenticateUser should accept `req` and return user object or null/throw.
        const currentUser = await authenticateUser(false, true);
        if (!currentUser) return createErrorResponse("Authentication required", 401);

        // Load template
        const template = await Template.findOne({ _id: templateId, isActive: true }).lean();
        if (!template) return createErrorResponse("Template not found", 404);

        // Only coded templates are downloadable
        if (template.type !== "coded") {
            return createErrorResponse("Download not available for this template type", 403);
        }

        // If template is paid, ensure user purchased it
        if (template.price > 0) {
            const purchased = await userHasPurchased(String(currentUser._id), templateId);
            if (!purchased) return createErrorResponse("You must purchase this template to download it", 403);
        }
        // else {
        //     // Optional: validate single-use token for free templates (if you use tokens)
        //     if (token) {
        //         // placeholder for token validation (DB or Redis). If invalid, return 403.
        //         // e.g. const tokenRecord = await DownloadToken.findOne({ token, templateId }); ...
        //     }
        // }

        // Ensure fileKey
        const fileKey = template.fileKey;
        if (!fileKey) return createErrorResponse("Template file missing from storage", 500);

        // Generate short-lived signed URL and fetch server-to-server
        const signedUrl = await utapi.generateSignedURL(fileKey as string, { expiresIn: 60 });
        if (!signedUrl) {
            console.error("No signed URL for fileKey:", fileKey);
            return createErrorResponse("Failed to generate download link", 502);
        }

        // Forward Range header if present for resumable downloads
        const headersToForward: Record<string, string> = {};
        const incomingRange = req.headers.get("range");
        if (incomingRange) headersToForward["Range"] = incomingRange;

        const upstreamRes = await fetch(signedUrl?.ufsUrl, { method: "GET", headers: headersToForward });
        if (!upstreamRes.ok || !upstreamRes.body) {
            if (upstreamRes.status === 416) return createErrorResponse("Requested range not satisfiable", 416);
            console.error("Upstream fetch failed", { status: upstreamRes.status, statusText: upstreamRes.statusText });
            return createErrorResponse("Failed to fetch file from storage", 502);
        }

        // Build response headers from upstream
        const resHeaders = new Headers();
        const upstreamType = upstreamRes.headers.get("content-type");
        if (upstreamType) resHeaders.set("Content-Type", upstreamType);
        const upstreamLength = upstreamRes.headers.get("content-length");
        if (upstreamLength) resHeaders.set("Content-Length", upstreamLength);
        const upstreamAcceptRanges = upstreamRes.headers.get("accept-ranges");
        if (upstreamAcceptRanges) resHeaders.set("Accept-Ranges", upstreamAcceptRanges);
        const upstreamContentRange = upstreamRes.headers.get("content-range");
        if (upstreamContentRange) resHeaders.set("Content-Range", upstreamContentRange);

        // Filename derived only from title
        const rawTitle = (template.title && String(template.title).trim()) || (template.name && String(template.name).trim()) || "download";
        const suggestedFilename = sanitizeFilename(rawTitle);
        const encodedName = encodeURIComponent(suggestedFilename);
        resHeaders.set("Content-Disposition", `attachment; filename="${suggestedFilename.replace(/"/g, "")}"; filename*=UTF-8''${encodedName}`);
        resHeaders.set("Cache-Control", "no-store");
        resHeaders.set("X-Download-Template-Id", String(templateId));
        resHeaders.set("X-Download-Template-Type", String(template.type));

        // Async logging: increment counter & create DownloadLog
        await (async () => {
            try {
                // Increment download count
                await Template.updateOne({ _id: templateId }, { $inc: { downloads: 1 } }).exec();

                const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
                const userAgent = req.headers.get("user-agent") || "";
                const bytes = upstreamLength ? parseInt(upstreamLength, 10) : undefined;
                const statusCode = upstreamRes.status;

                await DownloadLog.create({
                    userId: currentUser._id,
                    templateId,
                    ip,
                    userAgent,
                    filename: suggestedFilename,
                    fileKey,
                    bytes,
                    status: statusCode >= 200 && statusCode < 300 ? "success" : "failed",
                    statusCode,
                    meta: { rangeRequested: Boolean(incomingRange) },
                });
            } catch (err) {
                console.warn("Failed to persist DownloadLog:", err);
            }
        })();

        const statusToReturn = upstreamRes.status === 206 ? 206 : 200;
        return new NextResponse(upstreamRes.body, { status: statusToReturn, headers: resHeaders });
    } catch (err) {
        console.error("free download error:", err);
        return createErrorResponse("Server error while processing download", 500);
    }
}

export const GET = withAPIMiddleware(downloadHandler, {
    rateLimit: {
        maxRequests: 60,
        windowMs: 15 * 60 * 1000,
    },
    validate: async (req: NextRequest) => {
        const validation = validateDownloadParams(req);
        return validation.isValid;
    },
});
