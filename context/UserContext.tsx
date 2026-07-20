"use client";
import { useUserStore } from "@/store/useUserStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ITemplate } from "@/lib/validations/template";

// Define minimal types to satisfy the backward compat
interface SocketMessage {
  ticketId: string;
  message: any;
}
interface TicketUpdate {
  ticketId: string;
  updates: any;
}

export const useUser = () => {
  const router = useRouter();
  const userState = useUserStore();
  const socketState = useSocketStore();
  const { socket, typingUsers } = socketState;

  const addToFavorites = async (template: ITemplate) => {
    if (!userState.user) return;
    userState.addToFavoritesLocal(template);
    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userState.user?._id,
          templateId: template._id,
          action: "add",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        userState.removeFromFavoritesLocal(template);
      }
    } catch (error) {
      userState.removeFromFavoritesLocal(template);
    }
  };

  const removeFromFavorites = async (template: ITemplate) => {
    if (!userState.user) return;
    userState.removeFromFavoritesLocal(template);
    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userState.user._id,
          templateId: template._id,
          action: "remove",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        userState.addToFavoritesLocal(template);
      }
    } catch (error) {
      userState.addToFavoritesLocal(template);
    }
  };

  const toggleFavorite = (template: ITemplate) => {
    if (!userState.user) return router.push("/login?message=unauthorized");
    if (userState.favoriteTemplates.some((t) => t._id === template._id))
      removeFromFavorites(template);
    else addToFavorites(template);
  };

  // Socket Proxy Methods
  const joinTicket = useCallback(
    (ticketId: string) => socket?.emit("join-ticket", ticketId),
    [socket],
  );
  const leaveTicket = useCallback(
    (ticketId: string) => socket?.emit("leave-ticket", ticketId),
    [socket],
  );
  const sendMessage = useCallback(
    (ticketId: string, message: any) =>
      socket?.emit("send-message", { ticketId, message }),
    [socket],
  );
  const setTyping = useCallback(
    (ticketId: string, isTyping: boolean) =>
      socket?.emit("typing", { ticketId, isTyping }),
    [socket],
  );
  const notifyTicketUpdate = useCallback(
    (ticketId: string, updates: any) =>
      socket?.emit("ticket-updated", { ticketId, updates }),
    [socket],
  );

  const onNewMessage = useCallback(
    (callback: (data: SocketMessage) => void) => {
      socket?.on("new-message", callback);
      return () => {
        socket?.off("new-message", callback);
      };
    },
    [socket],
  );

  const onTicketStatusChange = useCallback(
    (callback: (data: TicketUpdate) => void) => {
      socket?.on("ticket-status-changed", callback);
      return () => {
        socket?.off("ticket-status-changed", callback);
      };
    },
    [socket],
  );

  const onNewNotification = useCallback(
    (callback: (notification: any) => void) => {
      socket?.on("new-notification", callback);
      return () => {
        socket?.off("new-notification", callback);
      };
    },
    [socket],
  );

  const onUserStatusChange = useCallback(
    (
      callback: (data: {
        userId: string;
        status: "online" | "offline";
      }) => void,
    ) => {
      const handleOnline = (data: { userId: string }) =>
        callback({ userId: data.userId, status: "online" });
      const handleOffline = (data: { userId: string }) =>
        callback({ userId: data.userId, status: "offline" });
      socket?.on("user-online", handleOnline);
      socket?.on("user-offline", handleOffline);
      return () => {
        socket?.off("user-online", handleOnline);
        socket?.off("user-offline", handleOffline);
      };
    },
    [socket],
  );

  return {
    user: userState.user,
    setUser: userState.setUser,
    setReload: userState.triggerReload,
    favoriteTemplates: userState.favoriteTemplates,
    purchasedTemplates: userState.purchasedTemplates,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isConnected: socketState.isConnected,
    joinTicket,
    leaveTicket,
    sendMessage,
    setTyping,
    notifyTicketUpdate,
    onNewMessage,
    onTicketStatusChange,
    onNewNotification,
    onUserStatusChange,
    typingUsers,
  };
};
