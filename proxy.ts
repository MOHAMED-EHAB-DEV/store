import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/utils/api-helpers";
import { jwtVerify } from "jose";

function addSecurityHeaders(response: NextResponse) {
  response.headers.delete("X-Powered-By");

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com",
    "img-src 'self' blob: data: https://res.cloudinary.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.gstatic.com https://www.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://medo-store-store.hf.space wss://medo-store-store.hf.space ws://medo-store-store.hf.space https://medo-store-store.hf.space:7860 ws://medo-store-store.hf.space:7860 wss://medo-store-store.hf.space:7860 https://api.cloudinary.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https:",
    "media-src 'self' blob:",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
  ];

  if (process.env.NODE_ENV === "production")
    cspDirectives.push("upgrade-insecure-requests");

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups",
  );
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (process.env.NODE_ENV === "production")
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );

  return response;
}

const protectedRoutes = ["/dashboard", "/favourites"];
const adminRoutes = ["/admin"];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.includes(route));
}

function isAdminRoute(pathname: string) {
  return adminRoutes.some((route) => pathname.includes(route));
}

function isBannedRoute(pathname: string) {
  return pathname.includes("/banned");
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api");
}

function isAuthRoute(pathname: string) {
  return (
    pathname.startsWith("/api/user/login") ||
    pathname.startsWith("/api/user/register")
  );
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;
  const clientIP =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // 1. Early return for internal paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_static") ||
    pathname.startsWith("/.well-known")
  ) {
    return NextResponse.next();
  }

  // 2. Rate Limiting for API routes
  if (isApiRoute(pathname)) {
    const isAuth = isAuthRoute(pathname);
    const limitResult = RateLimiter.check(
      clientIP + (isAuth ? ":auth" : ":api"),
      isAuth ? 5 : 60, // 5 per 15min for auth, 60 per 15min for rest
      15 * 60 * 1000,
    );

    if (!limitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": (isAuth ? 5 : 60).toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limitResult.resetTime.toString(),
          },
        },
      );
    }
  }

  if (isApiRoute(pathname)) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // 3. Auth and Proxy Logic
  if (
    (pathname.includes("/login") || pathname.includes("/register")) &&
    token
  ) {
    const response = NextResponse.redirect(new URL(`/dashboard`, req.url));
    addSecurityHeaders(response);
    return response;
  }

  const reLogin = () => {
    if (process.env.DisableAuth) return NextResponse.next();
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("token");
    addSecurityHeaders(response);
    return response;
  };

  let decodedToken: any = null;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);
      decodedToken = payload;
    } catch (e) {
      decodedToken = null;
    }
  }

  if (isProtectedRoute(pathname)) {
    if (!token || !decodedToken) return reLogin();
  }

  if (isAdminRoute(pathname)) {
    if (!token || !decodedToken) return reLogin();
  }

  if (isBannedRoute(pathname)) {
    if (!token || !decodedToken) return reLogin();
  }

  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    {
      /*
       * Match all request paths except for the ones starting with:
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - mhd/images (image optimization files)
       * - _static (shared static files)
       * - favicon.ico, sitemap.xml, robots.txt, manifest.json, sw.js (metadata files)
       * - assets, Icons, images, Videos (custom static folders)
       * - Common image/video/font extensions
       */
      source:
        "/((?!api/|_next/static|_next/image|mhd/images|_static|favicon.ico|sitemap.xml|robots.txt|manifest.json|sw.js|assets/|Icons/|images/|Videos/|Logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    // Explicitly include API routes for rate limiting
    "/api/:path*",
  ],
};
