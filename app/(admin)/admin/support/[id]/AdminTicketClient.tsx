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

interface AdminTicketClientProps {
    ticketId: string;
    adminId: string;
}

export default function AdminTicketClient({ ticketId, adminId }: AdminTicketClientProps) {
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
        notifyTicketUpdate,
        onNewMessage,
        onTicketStatusChange,
        typingUsers
    } = useUser();

    const fetchTicket = async () => {
        try {
            const response = await fetch(`/api/support/tickets/${ticketId}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            setTicket(data.data.ticket);
            setMessages(data.data.messages);
        } catch (error: any) {
            toast.error(error.message);
            router.push("/admin/support");
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
            if (!response.ok) throw new Error(data.message);

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

    const handleUpdateStatus = async (status: string) => {
        try {
            const response = await fetch(`/api/admin/support/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            toast.success("Status updated");
            setTicket(data.data);

            // Broadcast via socket
            notifyTicketUpdate(ticketId, { status });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdatePriority = async (priority: string) => {
        try {
            const response = await fetch(`/api/admin/support/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            toast.success("Priority updated");
            setTicket(data.data);

            // Broadcast via socket
            notifyTicketUpdate(ticketId, { priority });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const otherTyping = typingUsers[ticketId]?.filter(id => id !== adminId) || [];

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/10 rounded w-1/3"></div>
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
                    href="/admin/support"
                    className="text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-2 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Support
                </Link>

                {/* Connection status */}
                <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-yellow-500"}`} />
                    <span className="text-muted-foreground">
                        {isConnected ? "Connected" : "Not Connected"}
                    </span>
                </div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Chat */}
                <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h1 className="text-lg font-bold text-white truncate">{ticket.subject}</h1>
                    </div>

                    <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwn={message.sender._id === adminId}
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
                                <span>Customer is typing...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {ticket.status !== "closed" ? (
                        <ChatInput
                            onSend={handleSendMessage}
                            onTyping={handleTyping}
                            placeholder="Reply to customer..."
                        />
                    ) : (
                        <div className="p-4 border-t border-white/10 text-center text-muted-foreground">
                            Ticket is closed
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* User Info */}
                    <div className="glass rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Customer</h3>
                        <div className="space-y-2">
                            <p className="text-white font-medium">{ticket.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{ticket.user?.email}</p>
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="glass rounded-xl p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-white">Ticket Details</h3>

                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={ticket.status} />
                                {ticket.status !== "closed" && (
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        className="text-xs rounded border border-white/10 bg-white/5 px-2 py-1 text-white"
                                    >
                                        <option value="open" className="bg-[#15161b]">Open</option>
                                        <option value="resolved" className="bg-[#15161b]">Resolved</option>
                                        <option value="closed" className="bg-[#15161b]">Closed</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                            <div className="flex items-center gap-2">
                                <PriorityBadge priority={ticket.priority} />
                                <select
                                    value={ticket.priority}
                                    onChange={(e) => handleUpdatePriority(e.target.value)}
                                    className="text-xs rounded border border-white/10 bg-white/5 px-2 py-1 text-white"
                                >
                                    <option value="low" className="bg-[#15161b]">Low</option>
                                    <option value="medium" className="bg-[#15161b]">Medium</option>
                                    <option value="high" className="bg-[#15161b]">High</option>
                                    <option value="urgent" className="bg-[#15161b]">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                            <span className="text-sm text-white capitalize">{ticket.category}</span>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Created</label>
                            <span className="text-sm text-white">
                                {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit"
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
