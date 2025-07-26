import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ["gsap", "lucide-react", "motion"],
    },
    typescript: {
        ignoreBuildErrors: true
    }
};

export default nextConfig;