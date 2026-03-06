"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL;

function generateVisitorId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "vi-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getOrCreateVisitorId(): string {
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

interface IAnalyticsContext {
  visitorId: string;
  onlineCount: number;
  isConnected: boolean;
}

const AnalyticsContext = createContext<IAnalyticsContext>({
  visitorId: "",
  onlineCount: 0,
  isConnected: false,
});

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [visitorId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return getOrCreateVisitorId();
  });

  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const trackedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!visitorId) return;

    const socket = io(SOCKET_URL, {
      auth: { visitorId },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("online-count", ({ count }: { count: number }) =>
      setOnlineCount(count),
    );

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [visitorId]);

  useEffect(() => {
    if (!visitorId || !pathname) return;

    if (trackedPaths.current.has(pathname)) return;
    trackedPaths.current.add(pathname);

    // Use requestIdleCallback when available so tracking fires when browser is idle
    const doTrack = () => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, path: pathname }),
        // keepalive ensures the request completes even if the page navigates away
        keepalive: true,
      }).catch(() => {
        // Silent fail – analytics must never affect the user
      });
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(doTrack, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    } else {
      const t = setTimeout(doTrack, 200);
      return () => clearTimeout(t);
    }
  }, [pathname, visitorId]);

  return (
    <AnalyticsContext.Provider value={{ visitorId, onlineCount, isConnected }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useAnalytics = () => useContext(AnalyticsContext);

/** Convenience hook for just the online count */
export const useOnlineCount = () => useContext(AnalyticsContext).onlineCount;
