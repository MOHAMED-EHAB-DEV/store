import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database-optimized';
import Template from '@/lib/models/optimized/Template';
import { 
    withAPIMiddleware, 
    validatePagination, 
    createAPIResponse,
    createErrorResponse
} from '@/lib/utils/api-helpers';

// Cache key generator for popular templates
function generateCacheKey(req: NextRequest): string {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const timeframe = searchParams.get('timeframe') || 'all'; // all, week, month
    const category = searchParams.get('category') || '';
    
    return `popular_templates:${page}:${limit}:${timeframe}:${category}`;
}

// Validate timeframe parameter
function validateTimeframe(timeframe: string): boolean {
    return ['all', 'week', 'month', 'year'].includes(timeframe);
}

async function getPopularTemplatesHandler(req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(req.url);
        const { limit, skip, page } = validatePagination(req);
        
        // Additional parameters
        const timeframe = searchParams.get('timeframe') || 'all';
        const category = searchParams.get('category')?.trim();
        const builtWith = searchParams.get('builtWith')?.trim();
        
        // Validation
        if (!validateTimeframe(timeframe)) {
            return createErrorResponse('Invalid timeframe. Must be: all, week, month, year', 400);
        }

        await connectToDatabase();

        // Build aggregation pipeline for better performance
        let matchStage: any = { isActive: true };

        // Timeframe filtering
        if (timeframe !== 'all') {
            const now = new Date();
            let cutoffDate: Date;
            
            switch (timeframe) {
                case 'week':
                    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    cutoffDate = new Date(0);
            }
            
            matchStage.createdAt = { $gte: cutoffDate };
        }

        // Category filtering
        if (category) {
            matchStage.categories = category;
        }

        // BuiltWith filtering
        if (builtWith) {
            const allowedBuiltWith = ['coded', 'figma', 'framer'];
            if (allowedBuiltWith.includes(builtWith)) {
                matchStage.builtWith = builtWith;
            } else {
                return createErrorResponse(`Invalid builtWith. Must be: ${allowedBuiltWith.join(', ')}`, 400);
            }
        }

        // Execute optimized aggregation pipeline
        const pipeline = [
            { $match: matchStage },
            {
                $addFields: {
                    // Advanced popularity score calculation
                    popularityScore: {
                        $add: [
                            { $multiply: ['$downloads', 3] }, // Downloads weight: 3x
                            { $multiply: ['$averageRating', 25] }, // Rating weight: 25x
                            { $multiply: ['$views', 0.1] }, // Views weight: 0.1x
                            { $multiply: ['$reviewCount', 2] }, // Reviews weight: 2x
                            { $cond: ['$isFeatured', 50, 0] }, // Featured boost: +50
                            {
                                // Recency boost (newer templates get slight boost)
                                $multiply: [
                                    {
                                        $max: [
                                            0,
                                            {
                                                $subtract: [
                                                    30,
                                                    {
                                                        $divide: [
                                                            { $subtract: [new Date(), '$createdAt'] },
                                                            1000 * 60 * 60 * 24 // Days
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    0.5
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { popularityScore: -1, downloads: -1, averageRating: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        { $project: { name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    as: 'categories',
                    pipeline: [
                        { $project: { name: 1, slug: 1 } }
                    ]
                }
            },
            { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
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
                    reviewCount: 1,
                    author: 1,
                    categories: 1,
                    tags: 1,
                    builtWith: 1,
                    isFeatured: 1,
                    createdAt: 1,
                    popularityScore: 1
                }
            }
        ];

        // Execute queries in parallel for better performance
        const [templates, totalCount] = await Promise.all([
            Template.aggregate(pipeline).allowDiskUse(true),
            Template.countDocuments(matchStage)
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const duration = Date.now() - startTime;

        // Add gradient colors for frontend (this was in original code)
        const templatesWithGradients = templates.map((template, idx) => ({
            ...template,
            // Simple gradient assignment (in production, this might come from a constants file)
            gradient: `linear-gradient(${135 + (idx * 30) % 360}deg, hsl(${(idx * 60) % 360}, 70%, 60%), hsl(${(idx * 60 + 180) % 360}, 70%, 40%))`
        }));

        // Performance monitoring
        if (duration > 300) {
            console.warn(`🐌 Slow popular templates query: ${duration}ms (timeframe: ${timeframe}, category: ${category})`);
        }

        return createAPIResponse(templatesWithGradients, {
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages
            },
            performance: {
                duration,
                cacheHit: false
            }
        });

    } catch (error) {
        console.error('Popular templates error:', error);
        return createErrorResponse('Failed to fetch popular templates', 500);
    }
}

// Export with aggressive caching since popular templates don't change frequently
export const GET = withAPIMiddleware(getPopularTemplatesHandler, {
    // Rate limiting: 200 requests per 15 minutes per IP (higher than search)
    rateLimit: {
        maxRequests: 200,
        windowMs: 15 * 60 * 1000
    },
    // Cache for 5 minutes (popular templates are relatively stable)
    cache: {
        ttl: 5 * 60 * 1000,
        keyGenerator: generateCacheKey
    }
});
