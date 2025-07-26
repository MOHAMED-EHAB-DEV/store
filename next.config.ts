import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
      optimizePackageImports: ["gsap", "lucide-react", "motion"],
  }
};

export default nextConfig;