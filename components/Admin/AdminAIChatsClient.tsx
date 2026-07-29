"use client";

import React, { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import { Search } from "@/components/ui/svgs/icons/Search";
import { Loader2 } from "@/components/ui/svgs/icons/Loader2";
import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";
import { Shield } from "@/components/ui/svgs/icons/Shield";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sonnerToast } from "@/components/ui/sonner";
import Link from "next/link";

interface AIChatMessage {
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
}

interface AIChatSession {
  _id: string;
  chatId: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  visitorId?: string;
  name?: string;
  email?: string;
  ipAddress?: string;
  messages: AIChatMessage[];
  isSpam: boolean;
  spamWarnings: number;
  isBanned: boolean;
  bannedUntil?: string;
  lastMessageAt: string;
  createdAt: string;
}

export default function AdminAIChatsClient() {
  const [chats, setChats] = useState<AIChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<AIChatSession | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updatingBan, setUpdatingBan] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [sendingAdminMessage, setSendingAdminMessage] = useState(false);

  const activeChatEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial chats or when search query updates
  useEffect(() => {
    fetchChats(1, false);
  }, [search]);

  // Scroll active chat view to bottom when a chat is selected or receives messages
  useEffect(() => {
    activeChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  const fetchChats = async (pageNum: number, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = `/api/admin/ai-chats?page=${pageNum}&limit=15&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (append) {
          setChats((prev) => [...prev, ...(data.data.items || [])]);
        } else {
          setChats(data.data.items || []);
          if (data.data.items?.length > 0 && !selectedChat) {
            setSelectedChat(data.data.items[0]);
          }
        }
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } else {
        sonnerToast.error(data.message || "Failed to load chats");
      }
    } catch (e) {
      sonnerToast.error("Error fetching AI chats");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchChats(page + 1, true);
    }
  };

  const handleToggleBan = async (chat: AIChatSession) => {
    setUpdatingBan(true);
    try {
      const isCurrentlyBanned = chat.isBanned && chat.bannedUntil && new Date(chat.bannedUntil) > new Date();
      const updatedBanState = !isCurrentlyBanned;
      
      const response = await fetch("/api/admin/ai-chats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.chatId,
          isBanned: updatedBanState,
          bannedUntil: updatedBanState ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
          spamWarnings: updatedBanState ? 3 : 0, // Reset warnings or max out
        }),
      });

      const resJson = await response.json();
      if (resJson.success) {
        sonnerToast.success(updatedBanState ? "User IP banned for a week" : "User unbanned successfully");
        
        // Refresh local chat lists state
        const updatedChat = {
          ...chat,
          isBanned: updatedBanState,
          bannedUntil: updatedBanState ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          spamWarnings: updatedBanState ? 3 : 0,
        };

        setChats((prev) => prev.map((c) => (c.chatId === chat.chatId ? updatedChat : c)));
        if (selectedChat?.chatId === chat.chatId) {
          setSelectedChat(updatedChat);
        }
      } else {
        sonnerToast.error(resJson.message || "Failed to update ban status");
      }
    } catch (e) {
      sonnerToast.error("Failed to update ban status");
    } finally {
      setUpdatingBan(false);
    }
  };

  const handleToggleSpam = async (chat: AIChatSession) => {
    try {
      const response = await fetch("/api/admin/ai-chats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.chatId,
          isSpam: !chat.isSpam,
        }),
      });

      const resJson = await response.json();
      if (resJson.success) {
        sonnerToast.success(chat.isSpam ? "Marked as safe" : "Marked as spam");
        
        const updatedChat = {
          ...chat,
          isSpam: !chat.isSpam,
        };

        setChats((prev) => prev.map((c) => (c.chatId === chat.chatId ? updatedChat : c)));
        if (selectedChat?.chatId === chat.chatId) {
          setSelectedChat(updatedChat);
        }
      }
    } catch (e) {
      sonnerToast.error("Failed to update spam status");
    }
  };

  const handleAdminSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInput.trim() || !selectedChat || sendingAdminMessage) return;

    setSendingAdminMessage(true);
    try {
      const response = await fetch("/api/admin/ai-chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat.chatId,
          message: adminInput.trim(),
        }),
      });

      const resJson = await response.json();
      if (resJson.success) {
        setAdminInput("");
        
        const newMsg: AIChatMessage = {
          role: "model",
          content: adminInput.trim(),
          timestamp: new Date().toISOString(),
        };

        const updatedChat = {
          ...selectedChat,
          messages: [...selectedChat.messages, newMsg],
          lastMessageAt: new Date().toISOString(),
        };

        setSelectedChat(updatedChat);
        setChats((prev) => prev.map((c) => (c.chatId === selectedChat.chatId ? updatedChat : c)));
      } else {
        sonnerToast.error(resJson.message || "Failed to send message");
      }
    } catch (e) {
      sonnerToast.error("Failed to send message");
    } finally {
      setSendingAdminMessage(false);
    }
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
    <div className="p-6 space-y-6 animate-in fade-in duration-500 text-white font-inter">
      <PageHeader
        title="AI Assistant Message Logs"
        description="Monitor user interactions, audit AI responses, and manage spam/IP bans"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "AI Messages" },
        ]}
      />

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        
        {/* Chats Sidebar */}
        <div className="lg:col-span-5 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex flex-col h-[700px] overflow-hidden">
          
          {/* Sidebar Search */}
          <div className="p-4 border-b border-neutral-800">
            <div className="relative">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search email, name, chatId, visitorId..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl ps-10 pe-4 py-2.5 text-sm placeholder-neutral-500 focus:border-purple-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900 scrollbar-thin">
            {loading && page === 1 ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : chats.length > 0 ? (
              <>
                {chats.map((chat) => {
                  const isChatBanned = chat.isBanned && chat.bannedUntil && new Date(chat.bannedUntil) > new Date();
                  const displayName = chat.userId?.name || chat.name || "Anonymous Visitor";
                  const displaySub = chat.userId?.email || chat.email || `Chat ID: ...${chat.chatId.slice(-8)}`;

                  return (
                    <div
                      key={chat.chatId}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer hover:bg-neutral-900/60 transition-colors flex flex-col gap-2 ${
                        selectedChat?.chatId === chat.chatId ? "bg-neutral-900" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-neutral-100 truncate">
                            {displayName}
                          </h4>
                          <p className="text-xs text-neutral-400 font-mono truncate">
                            {displaySub}
                          </p>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                          {new Date(chat.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Snippet from last message */}
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {chat.messages?.[chat.messages.length - 1]?.content || "No messages"}
                      </p>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {chat.userId ? (
                          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                            User
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                            Visitor
                          </Badge>
                        )}
                        {chat.isSpam && (
                          <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px]">
                            Spam warnings: {chat.spamWarnings}
                          </Badge>
                        )}
                        {isChatBanned && (
                          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                            Banned
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Infinite Load More Trigger */}
                {page < totalPages && (
                  <div className="p-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading more...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-neutral-500">No chats found.</div>
            )}
          </div>

        </div>

        {/* Selected Chat Dialogue */}
        <div className="lg:col-span-7 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex flex-col h-[700px] overflow-hidden">
          {selectedChat ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedChat.userId?.name || selectedChat.name || "Anonymous Visitor"}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400 font-mono mt-0.5">
                    {selectedChat.ipAddress && <span>IP: {selectedChat.ipAddress}</span>}
                    {selectedChat.visitorId && <span>Visitor ID: {selectedChat.visitorId}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleSpam(selectedChat)}
                    className="bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white text-xs h-8"
                  >
                    {selectedChat.isSpam ? "Mark Safe" : "Mark Spam"}
                  </Button>
                  <Button
                    variant={
                      selectedChat.isBanned && selectedChat.bannedUntil && new Date(selectedChat.bannedUntil) > new Date()
                        ? "default"
                        : "destructive"
                    }
                    size="sm"
                    disabled={updatingBan}
                    onClick={() => handleToggleBan(selectedChat)}
                    className="text-xs h-8"
                  >
                    {updatingBan && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                    {selectedChat.isBanned && selectedChat.bannedUntil && new Date(selectedChat.bannedUntil) > new Date()
                      ? "Unban User"
                      : "Ban User (1 Week)"}
                  </Button>
                </div>
              </div>

              {/* Chat Transcript Window */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-950/20 scrollbar-thin">
                {selectedChat.messages?.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none"
                      }`}
                    >
                      <div className="whitespace-pre-line">{renderMessageContent(msg.content)}</div>
                      <span className="block text-[9px] opacity-70 text-right mt-1 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={activeChatEndRef} />
              </div>

              {/* Admin Send Message Form */}
              <form
                onSubmit={handleAdminSend}
                className="p-4 border-t border-neutral-800 bg-neutral-900/20 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message to reply..."
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  disabled={sendingAdminMessage}
                  className="flex-1 bg-neutral-950 text-white placeholder-neutral-500 rounded-xl px-4 py-2.5 text-sm border border-neutral-800 focus:border-purple-600 outline-none transition-all"
                />
                <Button
                  type="submit"
                  disabled={sendingAdminMessage || !adminInput.trim()}
                  className="h-10 px-4"
                >
                  {sendingAdminMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </form>

              {/* Chat Session Audit Footer */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex flex-wrap justify-between items-center gap-3 text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Session Created: {new Date(selectedChat.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Message: {new Date(selectedChat.lastMessageAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-neutral-500 p-8">
              <AlertCircle className="w-12 h-12 mb-3 text-neutral-600 animate-pulse" />
              <p>No chat session selected.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
