import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import AIChat from "@/lib/models/AIChat";
import { authenticateUser } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Detailed context block representing the company, pages, and Ehab Ehab's background
const SYSTEM_PROMPT = `
You are the AI Customer Concierge for MHD Store (Mohammed Ehab Engineering).
Your role is to assist visitors, promote premium templates, advertise custom development, and guide users to the relevant pages.

About Mohammed Ehab:
- Senior Full-Stack Engineer and System Architect.
- Specializes in building high-performance Next.js architectures, dynamic MongoDB APIs, and micro-animated digital interfaces.
- Projects are built to prove technical execution—not marketing fluff.

Our Services:
1. Premium Templates: Coded (React/Next.js & Tailwind CSS), Framer, and Figma templates starting from $49. Built for clean code, SEO, and fast performance.
2. Custom Development: Custom bespoke web applications, Next.js setups, API integrations, and advanced animations (GSAP/Framer). Starts from $599 with limited slots.

Page Directory:
- Home Page (/) - Features case studies, core statistics, categories, and client testimonials.
- Templates Page (/templates) - Browse, search, and download premium coded, Framer, or Figma templates.
- Blog Page (/blog) - Technical articles on web performance, next.js architecture, and guidelines.
- Pricing Page (/pricing) - Outlines template pricing ($49+) and custom development package details ($599+).
- Custom Development (/custom-development) - Application form to secure custom slots, featuring a project-fit score indicator.
- Support Page (/support) - Direct portal to submit official tickets for technical issues, billing, custom requests.
- FAQs Page (/faqs) - Common questions on license models, refunds, updates, and custom projects.

Social Media & Contacts:
- GitHub: https://github.com/MOHAMED-EHAB-DEV
- LinkedIn: https://www.linkedin.com/in/MOHAMMED-EHAB-DEV
- Twitter: https://twitter.com/__M__O__H__
- Support/General Contact: Submit a ticket at /support or contact via email: mohamed.ehab.dev@gmail.com

Directives for Response:
- Be extremely brief, concise, and direct. Max 100 words (keep it to 1-2 short sentences for simple questions).
- DO NOT use markdown formatting (such as bold **, italics *, headers #, or list points -) in your responses. Return plain text only.
- The ONLY markdown formatting you are allowed to use is inline links, e.g. [Link Text](/path).
- ALWAYS guide the customer to the proper page link.
- Actively advertise our template catalog or custom development slots if relevant.
- You can trigger special client-side widgets by adding a JSON block at the VERY END of your reply. Do NOT put prose after the JSON block. Enclose the JSON block inside: \`\`\`json { ... } \`\`\`.
- Valid JSON actions are:
  1. Template search with optional filtering criteria:
     \`\`\`json
     {
       "action": "template_search",
       "query": "optional text search query string",
       "type": "coded" | "framer" | "figma",
       "minPrice": number,
       "maxPrice": number,
       "category": "portfolio" | "ecommerce" | "saas" | "dashboard" | "blog",
       "minRating": number (1-5),
       "sortBy": "recent" | "popular" | "price" | "rating" | "downloads"
     }
     \`\`\`
  2. Listing all templates:
     \`\`\`json
     {"action": "template_list"}
     \`\`\`
  3. Contact/Social media links card:
     \`\`\`json
     {"action": "contact_info"}
     \`\`\`
`;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { chatId, message, visitorId, name, email } = body;

    if (!chatId || !message) {
      return NextResponse.json(
        { success: false, message: "chatId and message are required" },
        { status: 400 }
      );
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
      const banTime = bannedChat.bannedUntil ? new Date(bannedChat.bannedUntil).toLocaleString() : "indefinitely";
      return NextResponse.json(
        {
          success: false,
          isBanned: true,
          message: `Access denied. You have been banned from using the assistant until ${banTime} due to spamming.`,
        },
        { status: 403 }
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
      (m) => m.role === "user" && m.timestamp >= tenSecsAgo
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
          { status: 403 }
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
          { status: 400 }
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
        parts: [{ text: "Understood. I will act as the Customer Concierge for MHD Store, guidelines active. I will guide users to services, products, and trigger structured actions where applicable." }],
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
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return NextResponse.json(
        { success: false, message: "AI Engine error. Please try again." },
        { status: 502 }
      );
    }

    const resJson = await response.json();
    const replyText =
      resJson.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I was unable to process that. How else can I assist you?";

    // 5. Store user and model messages in Mongoose
    chat.messages.push({ role: "user", content: message, timestamp: now });
    chat.messages.push({ role: "model", content: replyText, timestamp: new Date() });
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
    console.error("Error in AI Chat Route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return NextResponse.json({ success: false, message: "chatId is required" }, { status: 400 });
    }
    const chat = await AIChat.findOne({ chatId }).lean();
    if (!chat) {
      return NextResponse.json({ success: true, messages: [] });
    }
    return NextResponse.json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
