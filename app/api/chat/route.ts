import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import AIChat from "@/lib/models/AIChat";
import { authenticateUser } from "@/lib/auth";
import {
  withAPIMiddleware,
  createErrorResponse,
  handleCorsOptions,
} from "@/lib/utils/api-helpers";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Detailed context block representing the company, pages, and Mohammed Ehab's portfolio + store background
const SYSTEM_PROMPT = `
You are the official AI Assistant & Concierge for Mohammed Ehab and MHD Store (https://mhd-store.vercel.app).
Your role is to answer questions from recruiters, clients, technical managers, and shoppers regarding Mohammed's background, work experience, engineering skills, featured projects, commercial Next.js store templates, and custom development services.

### ABOUT MOHAMMED EHAB:
- Title: Senior Full-Stack Web Developer & Systems Architect
- Location: Egypt (UTC+2 / EET)
- Email: mohamed.ehab.dev@gmail.com / mohamed9919698@gmail.com
- Main Portfolio: https://mohammedehab.vercel.app
- Commercial Store: MHD Store (https://mhd-store.vercel.app)
- Social Links:
  - GitHub: https://github.com/MOHAMED-EHAB-DEV
  - LinkedIn: https://www.linkedin.com/in/1-mohammed
  - Instagram: https://www.instagram.__m4_e__/
  - Twitter/X: https://twitter.com/__M__O__H__
  - Support/General Contact: Submit a ticket at /support or contact via email: mohamed.ehab.dev@gmail.com

### TECHNICAL SKILLS:
- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Material UI (MUI), HTML5/CSS3.
- Backend & DB: Node.js, Express, MongoDB, Mongoose, RESTful APIs, NextAuth, Authentication & RBAC.
- Ecosystem & Tools: Git/GitHub, Vercel, Cloudinary, Liveblocks (real-time sync), Redux Toolkit, Zod, PostCSS.

### WORK EXPERIENCE:
1. Estajer — Full Stack Developer (Jan 2025 – Present)
   - Architected property & asset rental platform using Next.js ISR, SSG, and MongoDB aggregation pipelines.
   - Integrated Cloudinary media workflows and optimized page load times under 100ms.
2. Imperial Hotel — Front End Developer (Aug 2024 – Dec 2024)
   - Engineered luxury hospitality portal with Material UI, React, and responsive media galleries.

### FEATURED PROJECTS:
1. LiveDoc (Real-Time Collaborative Document Editor)
   - Real-time cursors, presence indicators, document editing with Liveblocks, Next.js, and MongoDB.
2. Formify (Google Forms Alternative)
   - Drag-and-drop form builder with real-time response collection, analytics, and CSV exports.
3. AI Article Summarizer
   - Content extraction tool summarizing article URLs using OpenAI API and Redis caching.
4. Estajer Rental Platform & Imperial Hotel Experience.

### COMMERCIAL TEMPLATES & SERVICES (MHD STORE):
- Mohammed builds and sells production-ready Next.js templates starting from $49 at https://mhd-store.vercel.app.
- Custom Development: Bespoke Next.js apps, backend API architecture, custom animations. Starts at $599.
- Store Pages:
  - Home: https://mhd-store.vercel.app/
  - Templates: https://mhd-store.vercel.app/templates
  - Blog: https://mhd-store.vercel.app/blog
  - Pricing: https://mhd-store.vercel.app/pricing
  - Custom Dev: https://mhd-store.vercel.app/custom-development
  - Support: https://mhd-store.vercel.app/support
  - FAQs: https://mhd-store.vercel.app/faqs

### BEHAVIOR RULES & DIRECTIVES:
1. Be professional, concise, direct, and polite. Max 100 words per response.
2. Promote direct contact via mohamed9919698@gmail.com / mohamed.ehab.dev@gmail.com for freelance work, full-time roles, or custom development.
3. Plain text output only. Do NOT use markdown bold (**), italics (*), or headers (#).
4. The ONLY allowed markdown is inline links e.g. [Link Text](https://url or /path).
5. Recommend MHD Store templates (https://mhd-store.vercel.app/templates) and portfolio projects (https://mohammedehab.vercel.app) whenever relevant.
6. You can trigger special client-side widgets by adding a JSON block at the VERY END of your reply. Enclose in \`\`\`json { ... } \`\`\`.
   Valid JSON actions:
   1. Template search: \`\`\`json {"action": "template_search", "query": "...", "type": "coded"|"framer"|"figma", "minPrice": 0, "maxPrice": 100, "category": "portfolio"|"ecommerce"|"saas"|"dashboard"|"blog"} \`\`\`
   2. Listing templates: \`\`\`json {"action": "template_list"} \`\`\`
   3. Contact card: \`\`\`json {"action": "contact_info"} \`\`\`
`;

export const OPTIONS = handleCorsOptions;

async function chatPostHandler(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return createErrorResponse("Gemini API key is not configured", 500, {
        req: request,
      });
    }

    await connectToDatabase();

    const body = await request.json();
    const { chatId, message, visitorId, name, email } = body;

    if (!chatId || !message) {
      return createErrorResponse("chatId and message are required", 400, {
        req: request,
      });
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Auth and Ban Check
    const user = await authenticateUser(false, true);
    const userId = user ? (user as any)._id : undefined;

    const banQuery: any = {
      isBanned: true,
      bannedUntil: { $gt: new Date() },
    };

    const banConditions: any[] = [{ ipAddress }];
    if (visitorId) banConditions.push({ visitorId });
    if (userId) banConditions.push({ userId: userId as any });
    banQuery.$or = banConditions;

    const bannedChat = await AIChat.findOne(banQuery);
    if (bannedChat) {
      const banTime = bannedChat.bannedUntil
        ? new Date(bannedChat.bannedUntil).toLocaleString()
        : "indefinitely";
      return NextResponse.json(
        {
          success: false,
          isBanned: true,
          message: `Access denied. You have been banned from using the assistant until ${banTime} due to spamming.`,
        },
        { status: 403 },
      );
    }

    // 2. Load or Create Chat Document
    let chat = await AIChat.findOne({ chatId });
    if (!chat) {
      chat = new AIChat({
        chatId,
        userId,
        visitorId,
        name: name || user?.name,
        email: email || user?.email,
        ipAddress,
        messages: [],
      });
    } else {
      // Sync names/emails/ids if available now
      if (userId && !chat.userId) chat.userId = userId as any;
      if (name && !chat.name) chat.name = name;
      if (email && !chat.email) chat.email = email;
      if (ipAddress && chat.ipAddress !== ipAddress) chat.ipAddress = ipAddress;
    }

    // 3. Spam Detection Check
    const now = new Date();
    const cleanMessage = message.trim();
    let isSpam = false;
    let spamReason = "";

    // Rule A: Rate Limit (max 5 messages in 10 seconds)
    const tenSecsAgo = new Date(now.getTime() - 10000);
    const recentMessagesCount = chat.messages.filter(
      (m) => m.role === "user" && m.timestamp >= tenSecsAgo,
    ).length;

    if (recentMessagesCount >= 5) {
      isSpam = true;
      spamReason = "Rate limit exceeded (too many messages in 10 seconds).";
    }

    // Rule B: Identical repeated messages
    const lastUserMessage = [...chat.messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage && lastUserMessage.content.trim() === cleanMessage) {
      isSpam = true;
      spamReason = "Repeated identical messages.";
    }

    // Rule C: Keyboard mash or gibberish (e.g. repeated characters like "aaaaaa" or empty/huge strings)
    if (cleanMessage.length > 2000 || /^(.)\1{5,}$/.test(cleanMessage)) {
      isSpam = true;
      spamReason = "Suspicious message payload or text patterns.";
    }

    if (isSpam) {
      chat.spamWarnings += 1;
      chat.isSpam = true;

      if (chat.spamWarnings >= 3) {
        chat.isBanned = true;
        chat.bannedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week ban
        await chat.save();
        return NextResponse.json(
          {
            success: false,
            isBanned: true,
            message: `You have been banned from this chat for 7 days due to repeated spam warnings. Reason: ${spamReason}`,
          },
          { status: 403 },
        );
      } else {
        await chat.save();
        return NextResponse.json(
          {
            success: false,
            isSpam: true,
            warnings: chat.spamWarnings,
            message: `Spam behavior detected. Warning ${chat.spamWarnings} of 3. Please refrain from spamming or your IP will be banned for a week.`,
          },
          { status: 400 },
        );
      }
    }

    // 4. Format history for Gemini API
    // Send system prompt + last 6 message turns (sliding window) to save tokens
    const recentHistory = chat.messages.slice(-6);
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I will act as the Customer Concierge for MHD Store, guidelines active. I will guide users to services, products, and trigger structured actions where applicable.",
          },
        ],
      },
      ...recentHistory.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return createErrorResponse("AI Engine error. Please try again.", 502, {
        req: request,
      });
    }

    const resJson = await response.json();
    const replyText =
      resJson.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I was unable to process that. How else can I assist you?";

    // 5. Store user and model messages in Mongoose
    chat.messages.push({ role: "user", content: message, timestamp: now });
    chat.messages.push({
      role: "model",
      content: replyText,
      timestamp: new Date(),
    });
    chat.lastMessageAt = new Date();
    await chat.save();

    // 6. Parse structured actions if any
    let parsedAction = null;
    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        parsedAction = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        // Safe fail
      }
    }

    return NextResponse.json({
      success: true,
      message: replyText.replace(/```json[\s\S]*?```/g, "").trim(), // Strip JSON payload from text
      action: parsedAction,
    });
  } catch (error: any) {
    return createErrorResponse("Internal server error", 500, {
      req: request,
      error,
    });
  }
}

async function chatGetHandler(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return createErrorResponse("chatId is required", 400, { req: request });
    }
    const chat = await AIChat.findOne({ chatId }).lean();
    if (!chat) {
      return NextResponse.json({ success: true, messages: [] });
    }
    return NextResponse.json({ success: true, messages: chat.messages });
  } catch (error) {
    return createErrorResponse("Internal server error", 500, {
      req: request,
      error,
    });
  }
}

export const POST = withAPIMiddleware(chatPostHandler, {
  cors: true,
  rateLimit: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
});

export const GET = withAPIMiddleware(chatGetHandler, {
  cors: true,
  rateLimit: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
});
