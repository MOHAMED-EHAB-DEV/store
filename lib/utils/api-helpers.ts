import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import ErrorLog from "../models/ErrorLog";
import { authenticateUser } from "@/lib/auth";
import { connectToDatabase } from "../database";
import { redis } from "@/lib/redis";

// Response caching utility backed by Upstash Redis
class APICache {
  private static readonly defaultTTL = 5 * 60 * 1000; // 5 minutes in ms

  static async get(key: string): Promise<any | null> {
    try {
      const val = await redis.get("cache:" + key);
      return val ?? null;
    } catch (error) {
      return null;
    }
  }

  static async set(key: string, data: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const ttlSeconds = Math.max(1, Math.floor(ttl / 1000));
      await redis.set("cache:" + key, data, { ex: ttlSeconds });
    } catch (error) {
      // Silent failure fallback
    }
  }

  static async invalidate(pattern?: string): Promise<void> {
    try {
      if (!pattern) {
        const keys = await redis.keys("cache:*");
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return;
      }
      const keys = await redis.keys("cache:*" + pattern + "*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      // Silent failure
    }
  }
}

// Rate limiting utility backed by Upstash Redis
class RateLimiter {
  static async check(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();

    // Bypass rate limiting in development mode
    if (process.env.NODE_ENV === "development") {
      return { allowed: true, remaining: maxRequests, resetTime: now + windowMs };
    }

    const key = `rl:${identifier}`;
    const windowSec = Math.max(1, Math.floor(windowMs / 1000));

    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSec);
      }

      const pttl = await redis.pttl(key);
      const resetTime = now + (pttl > 0 ? pttl : windowMs);
      const allowed = count <= maxRequests;
      const remaining = Math.max(0, maxRequests - count);

      return { allowed, remaining, resetTime };
    } catch (error) {
      // Fallback: allow request if Redis is temporarily unreachable
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }
  }
}

// Request validation utility
export function validatePagination(req: NextRequest): {
  limit: number;
  skip: number;
  page: number;
} {
  const { searchParams } = new URL(req.url);

  let limit = parseInt(searchParams.get("limit") || "20");
  let page = parseInt(searchParams.get("page") || "1");

  // Enforce limits
  limit = Math.min(Math.max(1, limit), 100); // Between 1 and 100
  page = Math.max(1, page); // At least 1

  const skip = (page - 1) * limit;

  return { limit, skip, page };
}

export function validateSort(
  allowedFields: string[],
  defaultSort: string = "createdAt",
): (req: NextRequest) => { sort: string; order: "asc" | "desc" } {
  return (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || defaultSort;
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    if (!allowedFields.includes(sort)) {
      return { sort: defaultSort, order: "desc" };
    }

    return { sort, order };
  };
}

// Performance monitoring utility buffered in Redis
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
  static startTimer(route: string, method: string) {
    return {
      route,
      method,
      startTime: Date.now(),
    };
  }

  static endTimer(
    timer: { route: string; method: string; startTime: number },
    statusCode: number,
    options: { cacheHit?: boolean; rateLimited?: boolean } = {},
  ) {
    // Bypass performance monitoring in development mode
    if (process.env.NODE_ENV === "development") {
      return;
    }

    const duration = Date.now() - timer.startTime;
    const metric: PerformanceMetrics = {
      route: timer.route,
      method: timer.method,
      duration,
      statusCode,
      timestamp: Date.now(),
      ...options,
    };

    // Buffer to Redis asynchronously for QStash batch processing
    redis.rpush("metrics:api:buffer", JSON.stringify(metric)).catch(() => {});

    // Log slow requests
    if (duration > 1000) {
      console.warn(
        `🐌 Slow API request: ${timer.method} ${timer.route} - ${duration}ms`,
      );
    }
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
  } = {},
): NextResponse {
  const {
    success = true,
    message = success ? "Success" : "Error",
    pagination,
  } = options;

  const response = {
    success,
    message,
    data,
    ...(pagination && { pagination }),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

export function createErrorResponse(
  message: string,
  statusCode: number = 400,
  options: {
    details?: any;
    req?: NextRequest;
    error?: any;
    operation?: string;
    visitorId?: string;
  } = {},
): NextResponse {
  const { details, req, error, operation, visitorId } = options;

  (async () => {
    try {
      const headerList = await headers();
      const userAgent = headerList?.get("user-agent") || undefined;

      const ip =
        headerList?.get("x-forwarded-for") ||
        headerList?.get("x-real-ip") ||
        "unknown";

      await connectToDatabase();

      const user = await authenticateUser(true, true);

      const errorLog = new ErrorLog({
        message:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : message,
        stack: error instanceof Error ? error.stack : undefined,
        route: req?.nextUrl.pathname,
        method: req?.method,
        status: statusCode,
        operation,
        userId: user?._id || undefined,
        visitorId,
        userAgent,
        ip,
        timestamp: new Date(),
      });

      await errorLog.save();
    } catch (logErr) {
      // Silent Failure
    }
  })();

  return NextResponse.json(
    {
      success: false,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}

// Middleware factory for API routes
export function withAPIMiddleware(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    rateLimit?: { maxRequests: number; windowMs: number };
    cache?: { ttl: number; keyGenerator?: (req: NextRequest) => string };
    auth?: boolean;
    validate?: (req: NextRequest) => Promise<boolean>;
  } = {
    rateLimit: { maxRequests: 60, windowMs: 10 * 60 * 1000 }, // Default: 60 req / 10 min
  },
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const timer = PerformanceMonitor.startTimer(
      req.nextUrl.pathname,
      req.method,
    );
    let cacheHit = false;
    let rateLimited = false;

    try {
      // Rate limiting
      if (options.rateLimit) {
        const clientIP =
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown";
        const rateLimitResult = await RateLimiter.check(
          clientIP,
          options.rateLimit.maxRequests,
          options.rateLimit.windowMs,
        );

        if (!rateLimitResult.allowed) {
          rateLimited = true;
          const response = createErrorResponse("Too many requests", 429, {
            details: { resetTime: rateLimitResult.resetTime },
            req,
          });

          PerformanceMonitor.endTimer(timer, 429, { rateLimited });
          return response;
        }

        // Add rate limit headers
        const responseHeaders = new Headers();
        responseHeaders.set(
          "X-RateLimit-Limit",
          options.rateLimit.maxRequests.toString(),
        );
        responseHeaders.set(
          "X-RateLimit-Remaining",
          rateLimitResult.remaining.toString(),
        );
        responseHeaders.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());
      }

      // Caching for GET requests
      if (req.method === "GET" && options.cache) {
        const cacheKey = options.cache.keyGenerator
          ? options.cache.keyGenerator(req)
          : req.nextUrl.pathname + req.nextUrl.search;

        const cachedData = await APICache.get(cacheKey);
        if (cachedData) {
          cacheHit = true;
          const response = NextResponse.json(cachedData);
          response.headers.set("X-Cache", "HIT");
          response.headers.set(
            "Cache-Control",
            `public, max-age=${Math.floor(options.cache.ttl / 1000)}`,
          );

          PerformanceMonitor.endTimer(timer, 200, { cacheHit });
          return response;
        }
      }

      // Validation
      if (options.validate) {
        const isValid = await options.validate(req);
        if (!isValid) {
          const response = createErrorResponse("Invalid request", 400, { req });
          PerformanceMonitor.endTimer(timer, 400);
          return response;
        }
      }

      // Execute handler
      const response = await handler(req, context);

      // Cache successful GET responses
      if (req.method === "GET" && options.cache && response.status === 200) {
        const cacheKey = options.cache.keyGenerator
          ? options.cache.keyGenerator(req)
          : req.nextUrl.pathname + req.nextUrl.search;

        try {
          const responseData = await response.clone().json();
          await APICache.set(cacheKey, responseData, options.cache.ttl);
          response.headers.set("X-Cache", "MISS");
          response.headers.set(
            "Cache-Control",
            `public, max-age=${Math.floor(options.cache.ttl / 1000)}`,
          );
        } catch (error) {
          // Silent Failure
        }
      }

      PerformanceMonitor.endTimer(timer, response.status, {
        cacheHit,
        rateLimited,
      });

      // Add security headers
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "SAMEORIGIN");
      response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

      return response;
    } catch (error) {
      const response = createErrorResponse("Internal server error", 500);
      PerformanceMonitor.endTimer(timer, 500);
      return response;
    }
  };
}

// Export utilities
export { APICache, RateLimiter, PerformanceMonitor };
