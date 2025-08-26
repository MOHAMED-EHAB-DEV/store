import { NextRequest, NextResponse } from 'next/server';

// Response caching utility
interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
}

class APICache {
    private static cache = new Map<string, CacheEntry>();
    private static readonly maxSize = 1000;
    private static readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

    static get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    static set(key: string, data: any, ttl: number = this.defaultTTL): void {
        // LRU behavior
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey as string);
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    static invalidate(pattern?: string): void {
        if (!pattern) {
            this.cache.clear();
            return;
        }

        const regex = new RegExp(pattern);
        for (const [key] of this.cache.entries()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    static getStats() {
        const now = Date.now();
        let valid = 0;
        let expired = 0;

        for (const entry of this.cache.values()) {
            if (now - entry.timestamp <= entry.ttl) {
                valid++;
            } else {
                expired++;
            }
        }

        return { total: this.cache.size, valid, expired };
    }
}

// Rate limiting utility
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private static attempts = new Map<string, RateLimitEntry>();
    private static readonly cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of this.attempts.entries()) {
            if (now > entry.resetTime) {
                this.attempts.delete(key);
            }
        }
    }, 60 * 1000); // Cleanup every minute

    static check(
        identifier: string,
        maxRequests: number = 100,
        windowMs: number = 15 * 60 * 1000 // 15 minutes
    ): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const entry = this.attempts.get(identifier);

        if (!entry || now > entry.resetTime) {
            this.attempts.set(identifier, {
                count: 1,
                resetTime: now + windowMs
            });
            return {
                allowed: true,
                remaining: maxRequests - 1,
                resetTime: now + windowMs
            };
        }

        if (entry.count >= maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime
            };
        }

        entry.count++;
        return {
            allowed: true,
            remaining: maxRequests - entry.count,
            resetTime: entry.resetTime
        };
    }
}

// Request validation utility
export function validatePagination(req: NextRequest): {
    limit: number;
    skip: number;
    page: number;
} {
    const { searchParams } = new URL(req.url);

    let limit = parseInt(searchParams.get('limit') || '20');
    let page = parseInt(searchParams.get('page') || '1');

    // Enforce limits
    limit = Math.min(Math.max(1, limit), 100); // Between 1 and 100
    page = Math.max(1, page); // At least 1

    const skip = (page - 1) * limit;

    return { limit, skip, page };
}

export function validateSort(
    allowedFields: string[],
    defaultSort: string = 'createdAt'
): (req: NextRequest) => { sort: string; order: 'asc' | 'desc' } {
    return (req: NextRequest) => {
        const { searchParams } = new URL(req.url);
        const sort = searchParams.get('sort') || defaultSort;
        const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

        if (!allowedFields.includes(sort)) {
            return { sort: defaultSort, order: 'desc' };
        }

        return { sort, order };
    };
}

// Performance monitoring utility
interface PerformanceMetrics {
    route: string;
    method: string;
    duration: number;
    statusCode: number;
    timestamp: number;
    cacheHit?: boolean;
    rateLimited?: boolean;
}

class PerformanceMonitor {
    private static metrics: PerformanceMetrics[] = [];
    private static readonly maxMetrics = 1000;

    static startTimer(route: string, method: string) {
        return {
            route,
            method,
            startTime: Date.now()
        };
    }

    static endTimer(
        timer: { route: string; method: string; startTime: number },
        statusCode: number,
        options: { cacheHit?: boolean; rateLimited?: boolean } = {}
    ) {
        const duration = Date.now() - timer.startTime;

        this.metrics.push({
            route: timer.route,
            method: timer.method,
            duration,
            statusCode,
            timestamp: Date.now(),
            ...options
        });

        // Keep only recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }

        // Log slow requests
        if (duration > 1000) {
            console.warn(`🐌 Slow API request: ${timer.method} ${timer.route} - ${duration}ms`);
        }
    }

    static getStats(minutes: number = 5) {
        const cutoff = Date.now() - minutes * 60 * 1000;
        const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

        if (recentMetrics.length === 0) {
            return { totalRequests: 0, averageResponseTime: 0, errorRate: 0 };
        }

        const totalRequests = recentMetrics.length;
        const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
        const errorRequests = recentMetrics.filter(m => m.statusCode >= 400).length;
        const errorRate = (errorRequests / totalRequests) * 100;
        const cacheHitRate = (recentMetrics.filter(m => m.cacheHit).length / totalRequests) * 100;

        return {
            totalRequests,
            averageResponseTime: Math.round(averageResponseTime),
            errorRate: Math.round(errorRate * 100) / 100,
            cacheHitRate: Math.round(cacheHitRate * 100) / 100,
            slowRequests: recentMetrics.filter(m => m.duration > 1000).length
        };
    }
}

// Response helper utility
export function createAPIResponse<T>(
    data: T,
    options: {
        success?: boolean;
        message?: string;
        pagination?: {
            page: number;
            limit: number;
            total?: number;
            totalPages?: number;
        };
        performance?: {
            duration: number;
            cacheHit?: boolean;
        };
    } = {}
): NextResponse {
    const {
        success = true,
        message = success ? 'Success' : 'Error',
        pagination,
        performance
    } = options;

    const response = {
        success,
        message,
        data,
        ...(pagination && { pagination }),
        ...(performance && { performance }),
        timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
}

export function createErrorResponse(
    message: string,
    statusCode: number = 400,
    details?: any
): NextResponse {
    return NextResponse.json({
        success: false,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString()
    }, { status: statusCode });
}

// Middleware factory for API routes
export function withAPIMiddleware(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
    options: {
        rateLimit?: { maxRequests: number; windowMs: number };
        cache?: { ttl: number; keyGenerator?: (req: NextRequest) => string };
        auth?: boolean;
        validate?: (req: NextRequest) => Promise<boolean>;
    } = {}
) {
    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
        const timer = PerformanceMonitor.startTimer(req.nextUrl.pathname, req.method);
        let cacheHit = false;
        let rateLimited = false;

        try {
            // Rate limiting
            if (options.rateLimit) {
                const clientIP = req.headers.get('x-forwarded-for') ||
                    req.headers.get('x-real-ip') || 'unknown';
                const rateLimitResult = RateLimiter.check(
                    clientIP,
                    options.rateLimit.maxRequests,
                    options.rateLimit.windowMs
                );

                if (!rateLimitResult.allowed) {
                    rateLimited = true;
                    const response = createErrorResponse(
                        'Too many requests',
                        429,
                        { resetTime: rateLimitResult.resetTime }
                    );

                    PerformanceMonitor.endTimer(timer, 429, { rateLimited });
                    return response;
                }

                // Add rate limit headers
                const headers = new Headers();
                headers.set('X-RateLimit-Limit', options.rateLimit.maxRequests.toString());
                headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
                headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
            }

            // Caching for GET requests
            if (req.method === 'GET' && options.cache) {
                const cacheKey = options.cache.keyGenerator ?
                    options.cache.keyGenerator(req) :
                    req.nextUrl.pathname + req.nextUrl.search;

                const cachedData = APICache.get(cacheKey);
                if (cachedData) {
                    cacheHit = true;
                    const response = NextResponse.json(cachedData);
                    response.headers.set('X-Cache', 'HIT');
                    response.headers.set('Cache-Control', `public, max-age=${Math.floor(options.cache.ttl / 1000)}`);

                    PerformanceMonitor.endTimer(timer, 200, { cacheHit });
                    return response;
                }
            }

            // Validation
            if (options.validate) {
                const isValid = await options.validate(req);
                if (!isValid) {
                    const response = createErrorResponse('Invalid request', 400);
                    PerformanceMonitor.endTimer(timer, 400);
                    return response;
                }
            }

            // Execute handler
            const response = await handler(req, context);

            // Cache successful GET responses
            if (req.method === 'GET' && options.cache && response.status === 200) {
                const cacheKey = options.cache.keyGenerator ?
                    options.cache.keyGenerator(req) :
                    req.nextUrl.pathname + req.nextUrl.search;

                try {
                    const responseData = await response.clone().json();
                    APICache.set(cacheKey, responseData, options.cache.ttl);
                    response.headers.set('X-Cache', 'MISS');
                    response.headers.set('Cache-Control', `public, max-age=${Math.floor(options.cache.ttl / 1000)}`);
                } catch (error) {
                    console.warn('Failed to cache response:', error);
                }
            }

            PerformanceMonitor.endTimer(timer, response.status, { cacheHit, rateLimited });
            return response;

        } catch (error) {
            console.error('API middleware error:', error);
            const response = createErrorResponse('Internal server error', 500);
            PerformanceMonitor.endTimer(timer, 500);
            return response;
        }
    };
}

// Export utilities
export { APICache, RateLimiter, PerformanceMonitor };