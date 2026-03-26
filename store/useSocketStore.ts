import { create } from "zustand";
import { Socket } from "socket.io-client";

interface SocketMessage {
  ticketId: string;
  message: any;
}

interface SocketState {
  isConnected: boolean;
  socket: Socket | null;
  typingUsers: Record<string, string[]>;
  setIsConnected: (status: boolean) => void;
  setSocket: (socket: Socket | null) => void;
  setTypingUsers: (typingUsers: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  socket: null,
  typingUsers: {},
  setIsConnected: (status) => set({ isConnected: status }),
  setSocket: (socket) => set({ socket }),
  setTypingUsers: (updater) => set((state) => ({
    typingUsers: typeof updater === 'function' ? updater(state.typingUsers) : updater
  })),
}));
