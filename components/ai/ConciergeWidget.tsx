"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "@/components/ui/svgs/icons/X";
import { Chat } from "@/components/ui/svgs/icons/Chat";
import { Sparkles } from "@/components/ui/svgs/icons/Sparkles";
import { Loader2 } from "@/components/ui/svgs/icons/Loader2";
import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { Twitter } from "@/components/ui/svgs/icons/Twitter";
import { Linkedin } from "@/components/ui/svgs/icons/Linkedin";
import { Mail } from "@/components/ui/svgs/icons/Mail";
import { Headset } from "@/components/ui/svgs/icons/Headset";
import Image from "next/image";
import { createImageProxyLoader } from "@/lib/utils/image";
import Link from "next/link";

interface Message {
  role: "user" | "model" | "system";
  content: string;
  action?: {
    action: "template_search" | "template_list" | "contact_info";
    query?: string;
  } | null;
}

interface TemplateItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  type: string;
  averageRating: number;
}

export default function ConciergeWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };
  const [chatId, setChatId] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I am your AI Customer Concierge. I can guide you to our premium design templates, custom Next.js engineering slots, or help you contact Mohammed Ehab. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chatId and visitorId
  useEffect(() => {
    let storedChatId = localStorage.getItem("mhd_ai_chat_id");
    if (!storedChatId) {
      storedChatId = `chat_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem("mhd_ai_chat_id", storedChatId);
    }
    setChatId(storedChatId);

    let storedVisitorId = localStorage.getItem("mhd_visitor_id");
    if (!storedVisitorId) {
      storedVisitorId = `visitor_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem("mhd_visitor_id", storedVisitorId);
    }
    setVisitorId(storedVisitorId);
  }, []);

  // Load chat history on mount
  useEffect(() => {
    if (!chatId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat?chatId=${chatId}`);
        const data = await res.json();
        if (data.success && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch (e) {
        // Safe fail
      }
    };
    fetchHistory();
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading || isBanned) return;

    if (!textToSend) setInput("");
    setWarning(null);

    // Append user message
    const newMessages = [...messages, { role: "user", content: text } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          visitorId,
          message: text,
        }),
      });

      const data = await response.json();

      if (response.status === 403 && data.isBanned) {
        setIsBanned(true);
        setWarning(data.message);
        setMessages((prev) => [
          ...prev,
          { role: "system", content: "Chat disabled. Banned due to spamming." },
        ]);
        return;
      }

      if (response.status === 400 && data.isSpam) {
        setWarning(data.message);
        // Do not add spam warnings to database messages display, just show toast warning
        return;
      }

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: data.message,
            action: data.action,
          },
        ]);

        // If action triggers template loading
        if (data.action?.action === "template_list" || data.action?.action === "template_search") {
          fetchTemplates(data.action);
        }
      } else {
        setWarning(data.message || "Something went wrong.");
      }
    } catch (err) {
      setWarning("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async (action: any) => {
    setLoadingTemplates(true);
    try {
      const params = new URLSearchParams();
      if (action) {
        if (action.query) params.set("search", action.query);
        if (action.type) params.set("type", action.type);
        if (action.minPrice !== undefined) params.set("minPrice", action.minPrice.toString());
        if (action.maxPrice !== undefined) params.set("maxPrice", action.maxPrice.toString());
        if (action.category) params.set("categories", action.category);
        if (action.minRating !== undefined) params.set("minRating", action.minRating.toString());
        if (action.sortBy) params.set("sortBy", action.sortBy);
      }
      params.set("limit", "3");

      const res = await fetch(`/api/template/search?${params.toString()}`);
      const resJson = await res.json();
      if (resJson.success) {
        setTemplates(resJson.data || []);
      }
    } catch (e) {
      // safe fail
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const renderMessageContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, text, url] = match;
      const index = match.index;

      if (index > lastIndex) {
        parts.push(content.substring(lastIndex, index));
      }

      parts.push(
        <Link
          key={index}
          href={url}
          className="text-purple-400 no-underline hover:text-purple-300 font-semibold transition-colors"
        >
          {text}
        </Link>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="fixed bottom-6 end-6 z-50 font-inter">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Concierge chat"
          aria-expanded={false}
          aria-haspopup="dialog"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 text-white shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer border border-white/20"
        >
          <div aria-hidden="true" className="absolute inset-0 rounded-full bg-purple-600/30 blur-md group-hover:blur-lg transition-all" />
          <Chat className="w-6 h-6 relative z-10" aria-hidden="true" />
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {(isOpen || isClosing) && (
        <div className={`w-[380px] sm:w-[420px] h-[600px] flex flex-col bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden duration-300 ${isClosing ? "animate-out fade-out slide-out-to-bottom-5" : "animate-in fade-in slide-in-from-bottom-5"}`}>
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-purple-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">MHD AI Concierge</h3>
                <span className="text-[10px] text-purple-400 font-mono tracking-wider uppercase">Active Assistant</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close chat"
              className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Messages Window */}
          <div role="log" aria-live="polite" aria-label="Chat messages" className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950 scrollbar-thin">
            {messages.map((msg, index) => (
              <div key={index} className="space-y-2" data-lenis-prevent>
                <div
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-tr-none"
                        : msg.role === "system"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 w-full text-center"
                        : "bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>

                {/* Structured UI Widgets Triggered by Actions */}
                {msg.role === "model" && msg.action && (
                  <div className="pl-2 pr-6 py-2">
                    
                    {/* Contact Card Action */}
                    {msg.action.action === "contact_info" && (
                      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-inner">
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                          Quick Contact Options
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href="https://twitter.com/__M__O__H__"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs hover:border-purple-500/50 hover:bg-purple-950/20 text-neutral-300 hover:text-white transition-all"
                          >
                            <Twitter className="w-4 h-4 text-sky-400" />
                            <span>Twitter</span>
                          </a>
                          <a
                            href="https://www.linkedin.com/in/1-mohammed"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs hover:border-purple-500/50 hover:bg-purple-950/20 text-neutral-300 hover:text-white transition-all"
                          >
                            <Linkedin className="w-4 h-4 text-blue-500" />
                            <span>LinkedIn</span>
                          </a>
                          <a
                            href="mailto:mohamed.ehab.dev@gmail.com"
                            className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs hover:border-purple-500/50 hover:bg-purple-950/20 text-neutral-300 hover:text-white transition-all"
                          >
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <span>Email</span>
                          </a>
                          <a
                            href="/support"
                            className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs hover:border-purple-500/50 hover:bg-purple-950/20 text-neutral-300 hover:text-white transition-all"
                          >
                            <Headset className="w-4 h-4 text-pink-400" />
                            <span>Support Ticket</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Template Search or List Action */}
                    {(msg.action.action === "template_list" || msg.action.action === "template_search") && (
                      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-inner">
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                          Matched Design Templates
                        </h4>
                        {loadingTemplates ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                          </div>
                        ) : templates.length > 0 ? (
                          <div className="space-y-2">
                            {templates.map((tpl) => (
                              <Link
                                href={`/templates/${tpl.slug}`}
                                key={tpl._id}
                                className="flex items-center gap-3 p-2 bg-neutral-900 border border-neutral-850 rounded-lg hover:border-purple-500/30 transition-all"
                              >
                                <Image
                                  width={48}
                                  height={48}
                                  loader={createImageProxyLoader(false)}
                                  src={tpl.thumbnail}
                                  alt={tpl.title}
                                  quality={50}
                                  className="w-12 h-12 rounded object-cover border border-neutral-800"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-white truncate">
                                    {tpl.title}
                                  </h5>
                                  <p className="text-[10px] text-neutral-400 font-mono capitalize">
                                    {tpl.type} • ★ {tpl.averageRating.toFixed(1)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-purple-400">
                                    ${tpl.price}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500 text-center py-2">
                            No templates match the request. View all on{" "}
                            <a href="/templates" className="text-purple-400 underline">
                              Templates Page
                            </a>.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" aria-hidden="true" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 border-t border-neutral-900 bg-neutral-950 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            <button
              onClick={() => handleSuggestionClick("Search for portfolio templates")}
              aria-label="Search for portfolio templates"
              className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1 rounded-full border border-neutral-800 transition-colors cursor-pointer"
            >
              🔍 Portfolios
            </button>
            <button
              onClick={() => handleSuggestionClick("Tell me about custom Next.js development slots")}
              aria-label="Ask about custom Next.js development slots"
              className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1 rounded-full border border-neutral-800 transition-colors cursor-pointer"
            >
              🚀 Custom Dev Slots
            </button>
            <button
              onClick={() => handleSuggestionClick("How can I contact Mohammed Ehab?")}
              aria-label="Ask how to contact Mohammed Ehab"
              className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1 rounded-full border border-neutral-800 transition-colors cursor-pointer"
            >
              📞 Contact Ehab
            </button>
          </div>

          {/* Spam warnings display */}
          {warning && (
            <div className="px-4 py-2 bg-red-950/20 border-t border-red-900/30 text-red-400 text-xs flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" aria-hidden="true" />
              <span>{warning}</span>
            </div>
          )}

          {/* Chat Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-neutral-950 border-t border-neutral-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isBanned ? "Chat disabled..." : "Ask the Concierge..."}
              aria-label="Message to AI Concierge"
              disabled={loading || isBanned}
              className="flex-1 bg-neutral-900 text-white placeholder-neutral-500 rounded-xl px-4 py-2.5 text-sm focus:border focus:border-purple-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || isBanned || !input.trim()}
              aria-label="Send message"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
