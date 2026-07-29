import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    qualities: [50, 75, 80, 85, 90, 95, 100],
  },
  async headers() {
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
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
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
  serverExternalPackages: [
    "shiki",
    "mongoose",
    "mongodb",
    "bcryptjs",
    "cloudinary",
    "googleapis",
    "jose",
    "sharp",
  ],
  logging: {
    browserToTerminal: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  reactStrictMode: true,
};

export default nextConfig;
