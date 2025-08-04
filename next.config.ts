import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ["gsap", "motion"],
        inlineCss: true,
        optimizeCss: true,
        cssChunking: true,
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
    compiler: {
        reactRemoveProperties: { properties: ['^data-test', '^data-vitest'] },
        removeConsole: { exclude: ['error'] },
    },
    crossOrigin: 'anonymous',
};

export default nextConfig;