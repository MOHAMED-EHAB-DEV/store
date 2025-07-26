import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
      optimizePackageImports: ["gsap", "lucide-react", "motion"],
  },
  ignoreBuildErrors: true
};

export default nextConfig;