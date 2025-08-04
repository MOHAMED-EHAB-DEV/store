import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ["gsap", "motion"],
        inlineCss: true,
        optimizeCss: true,
    },
    typescript: {
        ignoreBuildErrors: true
    },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;