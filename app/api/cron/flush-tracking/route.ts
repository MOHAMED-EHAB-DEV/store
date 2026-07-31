import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import { redis } from "@/lib/redis";
import { createAPIResponse, createErrorResponse } from "@/lib/utils/api-helpers";
import { Receiver } from "@upstash/qstash";

const receiver = process.env.QSTASH_CURRENT_SIGNING_KEY
  ? new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
    })
  : null;

async function verifyAuth(req: NextRequest, bodyText: string): Promise<boolean> {
  const secretParam = req.nextUrl.searchParams.get("secret");
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && secretParam === expectedSecret) {
    return true;
  }

  if (expectedSecret && authHeader === `Bearer ${expectedSecret}`) {
    return true;
  }

  const signature = req.headers.get("upstash-signature");
  if (receiver && signature) {
    try {
      const isValid = await receiver.verify({ signature, body: bodyText });
      if (isValid) return true;
    } catch {
      // Fallback
    }
  }

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const isAuthorized = await verifyAuth(req, bodyText);
    if (!isAuthorized) {
      return createErrorResponse("Unauthorized cron request", 401);
    }

    // Atomically move items to processing key
    const tempKey = `analytics:track:proc:${Date.now()}`;
    const renamed = await redis.rename("analytics:track:buffer", tempKey).catch(() => null);
    if (!renamed) {
      return createAPIResponse({ processed: 0, message: "Buffer empty" });
    }

    const rawItems = await redis.lrange(tempKey, 0, -1);
    await redis.del(tempKey);

    if (!rawItems || rawItems.length === 0) {
      return createAPIResponse({ processed: 0, message: "No items to flush" });
    }

    // Parse and aggregate by visitorId
    const visitorMap = new Map<
      string,
      {
        visitorId: string;
        lastVisit: Date;
        userAgent: string;
        ipHash: string;
        userId?: string;
        visitCount: number;
        pathEntries: { path: string; timestamp: Date }[];
      }
    >();

    for (const rawItem of rawItems) {
      try {
        const item = typeof rawItem === "string" ? JSON.parse(rawItem) : rawItem;
        const { visitorId, path, userAgent, ipHash, userId, timestamp } = item;

        if (!visitorId) continue;

        const dateObj = timestamp ? new Date(timestamp) : new Date();

        if (!visitorMap.has(visitorId)) {
          visitorMap.set(visitorId, {
            visitorId,
            lastVisit: dateObj,
            userAgent,
            ipHash,
            userId,
            visitCount: 1,
            pathEntries: [{ path: path || "/", timestamp: dateObj }],
          });
        } else {
          const existing = visitorMap.get(visitorId)!;
          existing.visitCount += 1;
          if (dateObj > existing.lastVisit) {
            existing.lastVisit = dateObj;
            if (userAgent) existing.userAgent = userAgent;
            if (ipHash) existing.ipHash = ipHash;
          }
          if (userId) existing.userId = userId;
          existing.pathEntries.push({ path: path || "/", timestamp: dateObj });
        }
      } catch (parseErr) {
        console.error("Error parsing track item:", parseErr);
      }
    }

    if (visitorMap.size === 0) {
      return createAPIResponse({ processed: 0, message: "No valid items parsed" });
    }

    await connectToDatabase();

    const bulkOps = Array.from(visitorMap.values()).map((v) => ({
      updateOne: {
        filter: { visitorId: v.visitorId },
        update: {
          $set: {
            lastVisit: v.lastVisit,
            userAgent: v.userAgent,
            ipHash: v.ipHash,
            ...(v.userId && { userId: v.userId }),
          },
          $inc: { visitCount: v.visitCount },
          $push: {
            pathHistory: {
              $each: v.pathEntries,
              $slice: -20,
            },
          },
        },
        upsert: true,
      },
    }));

    const result = await Visitor.bulkWrite(bulkOps, { ordered: false });

    return createAPIResponse({
      processed: rawItems.length,
      visitorsUpdated: visitorMap.size,
      matchedCount: result.matchedCount,
      upsertedCount: result.upsertedCount,
    });
  } catch (error: any) {
    console.error("Error in flush-tracking cron:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
