"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import StatusBadge from "@/components/Support/StatusBadge";
import PriorityBadge from "@/components/Support/PriorityBadge";
import MessageBubble from "@/components/Support/MessageBubble";
import ChatInput from "@/components/Support/ChatInput";
import { useUser } from "@/context/UserContext";

interface TicketDetailClientProps {
    ticketId: string;
    userId: string;
    socketToken?: string;
}

export default function TicketDetailClient({ ticketId, userId, socketToken }: TicketDetailClientProps) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Socket connection
    const {
        isConnected,
        joinTicket,
        leaveTicket,
        sendMessage: socketSendMessage,
        setTyping,
        onNewMessage,
        onTicketStatusChange,
        typingUsers
    } = useUser();

    const fetchTicket = async () => {
        try {
            const response = await fetch(`/api/support/tickets/${ticketId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch ticket");
            }

            setTicket(data.data.ticket);
            setMessages(data.data.messages);
        } catch (error: any) {
            toast.error(error.message);
            router.push("/dashboard/support");
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    // Socket room management
    useEffect(() => {
        if (isConnected && ticketId) {
            joinTicket(ticketId);
            return () => leaveTicket(ticketId);
        }
    }, [isConnected, ticketId, joinTicket, leaveTicket]);

    // Listen for new messages via socket
    useEffect(() => {
        const unsubscribe = onNewMessage((data) => {
            if (data.ticketId === ticketId) {
                setMessages(prev => [...prev, data.message]);
            }
        });
        return unsubscribe;
    }, [ticketId, onNewMessage]);

    // Listen for ticket status changes
    useEffect(() => {
        const unsubscribe = onTicketStatusChange((data) => {
            if (data.ticketId === ticketId) {
                setTicket((prev: any) => ({ ...prev, ...data.updates }));
            }
        });
        return unsubscribe;
    }, [ticketId, onTicketStatusChange]);

    // Fallback polling when socket not connected
    useEffect(() => {
        if (!isConnected) {
            const interval = setInterval(fetchTicket, 10000);
            return () => clearInterval(interval);
        }
    }, [isConnected, ticketId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        try {
            const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send message");
            }

            const newMessage = data.data;
            setMessages(prev => [...prev, newMessage]);

            // Broadcast via socket
            socketSendMessage(ticketId, newMessage);
            setTyping(ticketId, false);
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    const handleTyping = (typing: boolean) => {
        if (isConnected) {
            setTyping(ticketId, typing);
        }
    };

    const handleCloseTicket = async () => {
        if (!confirm("Are you sure you want to close this ticket?")) return;

        try {
            const response = await fetch(`/api/support/tickets/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "closed" })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to close ticket");
            }

            toast.success("Ticket closed");
            fetchTicket();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const otherTyping = typingUsers[ticketId]?.filter(id => id !== userId) || [];

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/10 rounded w-1/3"></div>
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                    <div className="h-96 bg-white/10 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="p-6 space-y-4">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-between">
                <Link
                    href="/dashboard/support"
                    className="text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-2 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Tickets
                </Link>

                {/* Connection status */}
                <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-yellow-500"}`} />
                    <span className="text-muted-foreground">
                        {isConnected ? "Live" : "Polling"}
                    </span>
                </div>
            </nav>

            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-white break-words">
                            {ticket.subject}
                        </h1>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <StatusBadge status={ticket.status} size="md" />
                            <PriorityBadge priority={ticket.priority} size="md" />
                            <span className="text-sm text-muted-foreground capitalize px-3 py-1 rounded-full bg-white/5">
                                {ticket.category}
                            </span>
                        </div>
                    </div>

                    {ticket.status !== "closed" && (
                        <button
                            onClick={handleCloseTicket}
                            className="btn btn-secondary text-sm"
                        >
                            Close Ticket
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h2 className="font-semibold text-white">Conversation</h2>
                </div>

                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <MessageBubble
                            key={message._id}
                            message={message}
                            isOwn={message.sender._id === userId}
                        />
                    ))}

                    {/* Typing indicator */}
                    {otherTyping.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span>Someone is typing...</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {ticket.status !== "closed" ? (
                    <ChatInput
                        onSend={handleSendMessage}
                        onTyping={handleTyping}
                    />
                ) : (
                    <div className="p-4 border-t border-white/10 text-center text-muted-foreground">
                        This ticket is closed. You cannot send new messages.
                    </div>
                )}
            </div>
        </div>
    );
}
