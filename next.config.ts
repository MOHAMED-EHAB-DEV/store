import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
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
      "media-src 'self' blob: https://res.cloudinary.com",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ];
    const ContentSecurityPolicy = cspDirectives.join("; ");
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "sonner",
      "gsap",
      "@gsap/react",
      "@visx/axis",
      "@visx/curve",
      "@visx/event",
      "@visx/gradient",
      "@visx/grid",
      "@visx/group",
      "@visx/responsive",
      "@visx/scale",
      "@visx/shape",
      "@visx/tooltip",
      "socket.io-client",
      "@next/third-parties",
      "clsx",
      "embla-carousel-react",
      "lenis",
      "tailwind-merge",
      "tailwindcss-animate",
      "zustand",
      "react-day-picker",
    ],
    optimizeCss: true,
    esmExternals: true,
    proxyClientMaxBodySize: "100mb",
  },
  serverExternalPackages: ["shiki", "mongoose", "mongodb", "bcryptjs", "cloudinary", "googleapis", "jose", "sharp"],
  logging: {
    browserToTerminal: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  reactStrictMode: true,
};

export default nextConfig;
