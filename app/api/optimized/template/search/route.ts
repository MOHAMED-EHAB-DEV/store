import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database-optimized';
import Template from '@/lib/models/optimized/Template';
import { 
    withAPIMiddleware, 
    validatePagination, 
    createAPIResponse, 
    createErrorResponse 
} from '@/lib/utils/api-helpers';

// Validation schema for search parameters
function validateSearchParams(req: NextRequest): {
    isValid: boolean;
    params?: any;
    error?: string;
} {
    try {
        const { searchParams } = new URL(req.url);
        
        const search = searchParams.get('search')?.trim() || '';
        const categories = searchParams.get('categories')?.split(',').map(id => id.trim()).filter(Boolean) || [];
        const tags = searchParams.get('tags')?.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) || [];
        const builtWith = searchParams.get('builtWith')?.split(',').map(tech => tech.trim()).filter(Boolean) || [];
        const sortBy = searchParams.get('sortBy') || 'popular';
        
        // Price range validation
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const priceRange: { min?: number; max?: number } = {};
        
        if (minPrice !== null) {
            const min = parseFloat(minPrice);
            if (isNaN(min) || min < 0) {
                return { isValid: false, error: 'Invalid minPrice parameter' };
            }
            priceRange.min = min;
        }
        
        if (maxPrice !== null) {
            const max = parseFloat(maxPrice);
            if (isNaN(max) || max < 0) {
                return { isValid: false, error: 'Invalid maxPrice parameter' };
            }
            priceRange.max = max;
        }
        
        if (priceRange.min !== undefined && priceRange.max !== undefined && priceRange.min > priceRange.max) {
            return { isValid: false, error: 'minPrice cannot be greater than maxPrice' };
        }

        // Rating validation
        const minRating = searchParams.get('minRating');
        let minRatingValue: number | undefined;
        if (minRating !== null) {
            const rating = parseFloat(minRating);
            if (isNaN(rating) || rating < 0 || rating > 5) {
                return { isValid: false, error: 'minRating must be between 0 and 5' };
            }
            minRatingValue = rating;
        }

        // Sort validation
        const allowedSortBy = ['popular', 'recent', 'rating', 'price', 'downloads'];
        if (!allowedSortBy.includes(sortBy)) {
            return { isValid: false, error: `sortBy must be one of: ${allowedSortBy.join(', ')}` };
        }

        // BuiltWith validation
        const allowedBuiltWith = ['coded', 'figma', 'framer'];
        for (const tech of builtWith) {
            if (!allowedBuiltWith.includes(tech)) {
                return { isValid: false, error: `builtWith must contain only: ${allowedBuiltWith.join(', ')}` };
            }
        }

        // Limit search term length
        if (search.length > 100) {
            return { isValid: false, error: 'Search term too long (max 100 characters)' };
        }

        // Limit array sizes
        if (categories.length > 20) {
            return { isValid: false, error: 'Too many categories (max 20)' };
        }
        
        if (tags.length > 20) {
            return { isValid: false, error: 'Too many tags (max 20)' };
        }

        return {
            isValid: true,
            params: {
                search,
                categories,
                tags,
                builtWith,
                priceRange: Object.keys(priceRange).length > 0 ? priceRange : undefined,
                minRating: minRatingValue,
                sortBy
            }
        };
    } catch (error) {
        return { isValid: false, error: 'Invalid request parameters' };
    }
}

// Generate cache key for search results
function generateCacheKey(req: NextRequest): string {
    const { searchParams } = new URL(req.url);
    
    // Create a consistent key from search parameters
    const params = [
        searchParams.get('search') || '',
        searchParams.get('categories') || '',
        searchParams.get('tags') || '',
        searchParams.get('builtWith') || '',
        searchParams.get('minPrice') || '',
        searchParams.get('maxPrice') || '',
        searchParams.get('minRating') || '',
        searchParams.get('sortBy') || 'popular',
        searchParams.get('page') || '1',
        searchParams.get('limit') || '20'
    ].join('|');
    
    return `template_search:${Buffer.from(params).toString('base64')}`;
}

async function searchTemplatesHandler(req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
        // Validate search parameters
        const validation = validateSearchParams(req);
        if (!validation.isValid) {
            return createErrorResponse(validation.error!, 400);
        }

        const { params } = validation;
        const { limit, skip, page } = validatePagination(req);

        // Connect to database
        await connectToDatabase();

        // Execute search with optimized aggregation
        const searchOptions = {
            search: params.search,
            categories: params.categories,
            tags: params.tags,
            builtWith: params.builtWith,
            priceRange: params.priceRange,
            minRating: params.minRating,
            sortBy: params.sortBy
        };

        // Use aggregation for better performance
        const [templates, totalCount] = await Promise.all([
            Template.searchTemplates(searchOptions, limit, skip),
            Template.countDocuments({
                isActive: true,
                ...(params.search && { $text: { $search: params.search } }),
                ...(params.categories.length > 0 && {
                    categories: { $in: params.categories }
                }),
                ...(params.tags.length > 0 && {
                    tags: { $in: params.tags }
                }),
                ...(params.builtWith.length > 0 && {
                    builtWith: { $in: params.builtWith }
                }),
                ...(params.priceRange && {
                    price: {
                        ...(params.priceRange.min !== undefined && { $gte: params.priceRange.min }),
                        ...(params.priceRange.max !== undefined && { $lte: params.priceRange.max })
                    }
                }),
                ...(params.minRating && {
                    averageRating: { $gte: params.minRating }
                })
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const duration = Date.now() - startTime;

        // Performance logging
        if (duration > 500) {
            console.warn(`🐌 Slow search query: ${duration}ms for params:`, params);
        }

        return createAPIResponse(templates, {
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
        console.error('Template search error:', error);
        return createErrorResponse('Failed to search templates', 500);
    }
}

// Export with middleware
export const GET = withAPIMiddleware(searchTemplatesHandler, {
    // Rate limiting: 100 requests per 15 minutes per IP
    rateLimit: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000
    },
    // Cache results for 2 minutes
    cache: {
        ttl: 2 * 60 * 1000,
        keyGenerator: generateCacheKey
    },
    // Custom validation
    validate: async (req: NextRequest) => {
        const validation = validateSearchParams(req);
        return validation.isValid;
    }
});
