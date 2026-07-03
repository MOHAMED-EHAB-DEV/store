import { headers } from "next/headers";

export async function getBaseUrl() {
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mhd-store.vercel.app/";
    try {
        const headersList = await headers();
        const host = headersList.get("host");
        if (host) {
            const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
            baseUrl = `${protocol}://${host}`;
        }
    } catch {
        // Safe fallback when called outside request context (e.g. build time/prerendering)
    }
    return baseUrl;
}
