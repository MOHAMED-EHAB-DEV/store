import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import mongoose from "mongoose";
import {
    withAPIMiddleware,
    validatePagination,
    createAPIResponse,
    createErrorResponse,
} from "@/lib/utils/api-helpers";

function validateSimilarParams(req: NextRequest): {
    isValid: boolean;
    params?: any;
    error?: string;
} {
    try {
        const { searchParams } = new URL(req.url);

        const excludeId = searchParams.get("excludeId");
        if (!excludeId) {
            return { isValid: false, error: "excludeId parameter is required" };
        }

        const categories =
            searchParams
                .get("categories")
                ?.split(",")
                .map((id) => id.trim())
                .filter(Boolean) || [];
        const tags =
            searchParams
                .get("tags")
                ?.split(",")
                .map((tag) => tag.trim().toLowerCase())
                .filter(Boolean) || [];
        const builtWith = searchParams.get("builtWith");
        const limit = Number(searchParams.get("limit")) || 3;

        return {
            isValid: true,
            params: {
                excludeId,
                categories,
                tags,
                builtWith,
                limit,
            },
        };
    } catch (error) {
        return { isValid: false, error: "Invalid request parameters" };
    }
}

// --- Cache key generator ---
function generateSimilarCacheKey(req: NextRequest): string {
    const { searchParams } = new URL(req.url);

    const params = [
        searchParams.get("excludeId") || "",
        searchParams.get("categories") || "",
        searchParams.get("tags") || "",
        searchParams.get("builtWith") || "",
        searchParams.get("limit") || "3",
    ].join("|");

    return `similar_templates:${Buffer.from(params).toString("base64")}`;
}

// --- Main Handler ---
async function getSimilarTemplatesHandler(
    req: NextRequest
): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const validation = validateSimilarParams(req);
        if (!validation.isValid) {
            return createErrorResponse(validation.error!, 400);
        }

        const { excludeId, categories, tags, builtWith, limit } = validation.params;

        await connectToDatabase();

        // Build match conditions like before, but keep it as an object for aggregation
        const matchConditions: any = {
            isActive: true,
            $or: [],
        };

        // Exclude the given id (convert to ObjectId if valid)
        if (mongoose.Types.ObjectId.isValid(excludeId)) {
            matchConditions._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
        } else {
            matchConditions._id = { $ne: excludeId };
        }

        if (categories.length > 0) {
            matchConditions.$or.push({ categories: { $in: categories } });
        }
        if (tags.length > 0) {
            matchConditions.$or.push({ tags: { $in: tags } });
        }
        if (builtWith && builtWith.length > 0) {
            // if builtWith is comma separated you can split it earlier; keeping original behavior
            matchConditions.$or.push({ builtWith: { $in: [builtWith] } });
        }

        // If no similarity criteria provided → return error
        if (matchConditions.$or.length === 0) {
            return createErrorResponse(
                "At least one of categories, tags, or builtWith must be provided",
                400
            );
        }

        // Use aggregation to include review count
        const pipeline: any[] = [
            { $match: matchConditions },
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            // optional: populate author small projection (unwind later)
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: "author",
            //         foreignField: "_id",
            //         as: "author",
            //         pipeline: [{ $project: { name: 1, avatar: 1 } }],
            //     },
            // },
            // lookup reviews and count them
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "template",
                    as: "reviews",
                },
            },
            {
                $addFields: {
                    reviews: { $size: "$reviews" },
                },
            },
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    demoLink: 1,
                    price: 1,
                    downloads: 1,
                    views: 1,
                    averageRating: 1,
                    reviews: 1,
                    author: 1,
                    categories: 1,
                    tags: 1,
                    builtWith: 1,
                    createdAt: 1,
                },
            },
        ];

        const templates = await Template.aggregate(pipeline).allowDiskUse(true);

        const duration = Date.now() - startTime;

        return createAPIResponse(templates, {
            performance: { duration, cacheHit: false },
        });
    } catch (error) {
        console.error("Similar templates error:", error);
        return createErrorResponse("Failed to fetch similar templates", 500);
    }
}

// --- Export with middleware ---
export const GET = withAPIMiddleware(getSimilarTemplatesHandler, {
    rateLimit: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000,
    },
    cache: {
        ttl: 2 * 60 * 1000,
        keyGenerator: generateSimilarCacheKey,
    },
    validate: async (req: NextRequest) => {
        const validation = validateSimilarParams(req);
        return validation.isValid;
    },
});
