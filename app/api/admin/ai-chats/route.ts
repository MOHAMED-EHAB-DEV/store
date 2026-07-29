import { NextRequest } from "next/server";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";
import { connectToDatabase } from "@/lib/database";
import AIChat from "@/lib/models/AIChat";
import { authenticateUser } from "@/lib/auth";
import mongoose from "mongoose";

async function getAdminAIChats(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const { searchParams } = new URL(request.url);
    const { limit, skip, page } = validatePagination(request);
    const search = searchParams.get("search");
    const isBanned = searchParams.get("isBanned");
    const isSpam = searchParams.get("isSpam");

    const query: any = {};
    if (isBanned === "true") query.isBanned = true;
    if (isBanned === "false") query.isBanned = false;
    if (isSpam === "true") query.isSpam = true;

    if (search) {
      const cleanSearch = search.trim();
      const orConditions: any[] = [
        { email: { $regex: cleanSearch, $options: "i" } },
        { name: { $regex: cleanSearch, $options: "i" } },
        { chatId: { $regex: cleanSearch, $options: "i" } },
        { visitorId: { $regex: cleanSearch, $options: "i" } },
        { ipAddress: { $regex: cleanSearch, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(cleanSearch)) {
        orConditions.push({ userId: new mongoose.Types.ObjectId(cleanSearch) });
      }
      query.$or = orConditions;
    }

    const [chats, total] = await Promise.all([
      AIChat.find(query)
        .populate("userId", "name email avatar")
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AIChat.countDocuments(query),
    ]);

    return createAPIResponse(
      {
        items: chats,
      },
      {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    );
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error: error,
      operation: "adminGetAIChats",
    });
  }
}

async function updateAdminAIChat(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const body = await request.json();
    const { chatId, isBanned, bannedUntil, isSpam, spamWarnings } = body;

    if (!chatId) {
      return createErrorResponse("chatId is required", 400, { req: request });
    }

    const updates: any = {};
    if (isBanned !== undefined) updates.isBanned = isBanned;
    if (bannedUntil !== undefined) updates.bannedUntil = bannedUntil ? new Date(bannedUntil) : null;
    if (isSpam !== undefined) updates.isSpam = isSpam;
    if (spamWarnings !== undefined) updates.spamWarnings = spamWarnings;

    const chat = await AIChat.findOneAndUpdate({ chatId }, { $set: updates }, { new: true });
    if (!chat) {
      return createErrorResponse("AI Chat not found", 404, { req: request });
    }

    return createAPIResponse({ chat });
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error: error,
      operation: "adminUpdateAIChat",
    });
  }
}

async function adminSendAIMessage(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const body = await request.json();
    const { chatId, message } = body;

    if (!chatId || !message) {
      return createErrorResponse("chatId and message are required", 400, { req: request });
    }

    const chat = await AIChat.findOne({ chatId });
    if (!chat) {
      return createErrorResponse("AI Chat not found", 404, { req: request });
    }

    chat.messages.push({
      role: "system",
      content: message,
      timestamp: new Date()
    });
    chat.lastMessageAt = new Date();
    await chat.save();

    return createAPIResponse({ chat });
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error: error,
      operation: "adminSendAIChatMessage",
    });
  }
}

export const GET = withAPIMiddleware(getAdminAIChats);
export const PATCH = withAPIMiddleware(updateAdminAIChat);
export const POST = withAPIMiddleware(adminSendAIMessage);
