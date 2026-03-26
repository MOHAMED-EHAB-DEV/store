"use client";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";

export const useAnalytics = () => {
  const analyticsState = useAnalyticsStore();
  return {
    visitorId: analyticsState.visitorId,
    onlineCount: analyticsState.onlineCount,
    isConnected: analyticsState.isConnected,
  };
};

export const useOnlineCount = () => useAnalyticsStore((s) => s.onlineCount);
