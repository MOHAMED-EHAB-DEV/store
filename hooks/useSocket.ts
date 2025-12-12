"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

interface UseSocketOptions {
    enabled?: boolean;
    token?: string;
}

interface SocketMessage {
    ticketId: string;
    message: any;
}

interface TypingStatus {
    ticketId: string;
    userId: string;
    isTyping: boolean;
}

interface TicketUpdate {
    ticketId: string;
    updates: any;
}

export function useSocket({ enabled = true, token }: UseSocketOptions = {}) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

    // Initialize socket connection
    useEffect(() => {
        if (!enabled) {
            console.log("[Socket] Disabled");
            return;
        }

        // We now rely on cookies, so token is optional usually
        // if (!token) {
        //     console.log("[Socket] No token provided");
        //     return;
        // }

        console.log("[Socket] Connecting to:", SOCKET_URL);

        const socket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on("connect", () => {
            console.log("[Socket] Connected! ID:", socket.id);
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
            setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
            console.error("[Socket] Connection error:", error.message);
            setIsConnected(false);
        });

        // Handle typing status
        socket.on("user-typing", (data: TypingStatus) => {
            console.log("[Socket] User typing:", data);
            setTypingUsers(prev => {
                const ticketTyping = prev[data.ticketId] || [];
                if (data.isTyping) {
                    if (!ticketTyping.includes(data.userId)) {
                        return { ...prev, [data.ticketId]: [...ticketTyping, data.userId] };
                    }
                } else {
                    return { ...prev, [data.ticketId]: ticketTyping.filter(id => id !== data.userId) };
                }
                return prev;
            });
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [enabled, token]);

    // Join a ticket room
    const joinTicket = useCallback((ticketId: string) => {
        console.log("[Socket] Joining ticket:", ticketId);
        socketRef.current?.emit("join-ticket", ticketId);
    }, []);

    // Leave a ticket room
    const leaveTicket = useCallback((ticketId: string) => {
        socketRef.current?.emit("leave-ticket", ticketId);
    }, []);

    // Send a message
    const sendMessage = useCallback((ticketId: string, message: any) => {
        socketRef.current?.emit("send-message", { ticketId, message });
    }, []);

    // Set typing status
    const setTyping = useCallback((ticketId: string, isTyping: boolean) => {
        console.log("[Socket] Setting typing:", ticketId, isTyping);
        socketRef.current?.emit("typing", { ticketId, isTyping });
    }, []);

    // Notify ticket update
    const notifyTicketUpdate = useCallback((ticketId: string, updates: any) => {
        socketRef.current?.emit("ticket-updated", { ticketId, updates });
    }, []);

    // Subscribe to new messages
    const onNewMessage = useCallback((callback: (data: SocketMessage) => void) => {
        socketRef.current?.on("new-message", callback);
        return () => {
            socketRef.current?.off("new-message", callback);
        };
    }, []);

    // Subscribe to ticket status changes
    const onTicketStatusChange = useCallback((callback: (data: TicketUpdate) => void) => {
        socketRef.current?.on("ticket-status-changed", callback);
        return () => {
            socketRef.current?.off("ticket-status-changed", callback);
        };
    }, []);

    // Subscribe to new notifications
    const onNewNotification = useCallback((callback: (notification: any) => void) => {
        socketRef.current?.on("new-notification", callback);
        return () => {
            socketRef.current?.off("new-notification", callback);
        };
    }, []);

    const onUserStatusChange = useCallback((callback: (data: { userId: string, status: 'online' | 'offline' }) => void) => {
        const handleOnline = (data: { userId: string }) => callback({ userId: data.userId, status: 'online' });
        const handleOffline = (data: { userId: string }) => callback({ userId: data.userId, status: 'offline' });

        socketRef.current?.on("user-online", handleOnline);
        socketRef.current?.on("user-offline", handleOffline);

        return () => {
            socketRef.current?.off("user-online", handleOnline);
            socketRef.current?.off("user-offline", handleOffline);
        };
    }, []);

    return {
        isConnected,
        joinTicket,
        leaveTicket,
        sendMessage,
        setTyping,
        notifyTicketUpdate,
        onNewMessage,
        onTicketStatusChange,
        onNewNotification,
        onUserStatusChange,
        typingUsers
    };
}
