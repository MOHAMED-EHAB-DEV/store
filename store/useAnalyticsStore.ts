import { create } from "zustand";

interface AnalyticsState {
  visitorId: string;
  onlineCount: number;
  isConnected: boolean;
  setVisitorId: (id: string) => void;
  setOnlineCount: (count: number) => void;
  setIsConnected: (status: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  visitorId: "",
  onlineCount: 0,
  isConnected: false,
  setVisitorId: (id) => set({ visitorId: id }),
  setOnlineCount: (count) => set({ onlineCount: count }),
  setIsConnected: (status) => set({ isConnected: status }),
}));
