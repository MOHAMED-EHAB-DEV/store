import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ["gsap", "motion"],
        // inlineCss: true,
        optimizeCss: true,
        esmExternals: true,
    },
    // typescript: {
    //     ignoreBuildErrors: true,
    // },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
                pathname: "/**",
            },
        ],
        formats: ['image/avif', 'image/webp'],
        qualities: [100, 75]
    },
};

export default nextConfig;