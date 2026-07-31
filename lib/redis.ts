import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Helpful warning in dev mode if env vars are missing
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing. Redis operations will fail until configured."
    );
  }
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://placeholder.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "placeholder",
});
