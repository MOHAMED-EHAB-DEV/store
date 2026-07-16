"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/store/useUserStore";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useSocketStore } from "@/store/useSocketStore";
import dynamic from "next/dynamic";

const WebVitalsReporter = dynamic(
  () => import("@/components/SEO/WebVitalsReporter"),
  { ssr: false },
);
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const runWhenIdle = (callback: () => void, timeout = 2000) => {
  if (typeof window !== "undefined" && window.requestIdleCallback) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  } else {
    const id = setTimeout(callback, timeout);
    return () => clearTimeout(id);
  }
};

function generateVisitorId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "vi-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem("_vid");
    if (existing) return existing;
    const fresh = generateVisitorId();
    localStorage.setItem("_vid", fresh);
    return fresh;
  } catch {
    return generateVisitorId();
  }
}

export function GlobalStoreInitializer() {
  const pathname = usePathname();

  const { visitorId, setVisitorId, setOnlineCount } = useAnalyticsStore();
  const {
    user,
    setUser,
    reloadTrigger,
    setFavoriteTemplates,
    setPurchasedTemplates,
  } = useUserStore();
  const { setSocket, setIsConnected, setTypingUsers } = useSocketStore();

  const socketRef = useRef<Socket | null>(null);
  const trackedPaths = useRef<Set<string>>(new Set());

  // 1. Initialize Visitor ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      setVisitorId(getOrCreateVisitorId());
    }
  }, [setVisitorId]);

  // 2. Track Analytics Paths
  useEffect(() => {
    if (!visitorId || !pathname) return;

    if (trackedPaths.current.has(pathname)) return;
    trackedPaths.current.add(pathname);

    const doTrack = () => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, path: pathname }),
        keepalive: true,
      }).catch(() => {});
    };

    return runWhenIdle(doTrack, 200);
  }, [pathname, visitorId]);

  // 3. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      }
    };

    const fetchPurchasedTemplates = async () => {
      try {
        const res = await fetch(`/api/user/templates?idsOnly=true`);
        const data = await res.json();
        if (data.success) {
          setPurchasedTemplates(data.data);
        }
      } catch (error) {
        setPurchasedTemplates([]);
      }
    };

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`/api/user/favorites`);
        const data = await res.json();
        if (data.success) {
          setFavoriteTemplates(data.data.map((template: any) => template));
        }
      } catch (error) {
        setFavoriteTemplates([]);
      }
    };

    fetchUser().then(() => {
      fetchFavorites();
      fetchPurchasedTemplates();
    });
  }, [reloadTrigger, setUser, setPurchasedTemplates, setFavoriteTemplates]);

  // 4. Initialize Socket.io Connection
  useEffect(() => {
    if (!visitorId) return;

    const socket = io(SOCKET_URL, {
      auth: { visitorId, userId: user?._id, role: user?.role },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      if (user) {
        runWhenIdle(() => {
          fetch("/api/user/online", {
            method: "POST",
          });
        }, 200);
      }
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
      if (user) {
        runWhenIdle(() => {
          fetch("/api/user/offline", {
            method: "POST",
          });
        }, 200);
      }
    });
    socket.on("online-count", ({ count }: { count: number }) =>
      setOnlineCount(count),
    );

    socket.on("user-typing", (data: any) => {
      setTypingUsers((prev) => {
        const ticketTyping = prev[data.ticketId] || [];
        if (data.isTyping) {
          if (!ticketTyping.includes(data.userId)) {
            return { ...prev, [data.ticketId]: [...ticketTyping, data.userId] };
          }
        } else {
          return {
            ...prev,
            [data.ticketId]: ticketTyping.filter((id) => id !== data.userId),
          };
        }
        return prev;
      });
    });

    socketRef.current = socket;
    setSocket(socket);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [
    visitorId,
    user?._id,
    user?.role,
    setIsConnected,
    setOnlineCount,
    setTypingUsers,
    setSocket,
  ]);

  return <WebVitalsReporter />;
}
