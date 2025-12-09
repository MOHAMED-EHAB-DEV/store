"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface MessageBubbleProps {
    message: {
        _id: string;
        content: string;
        senderType: "user" | "admin";
        sender: {
            name: string;
            avatar?: string;
        };
        attachments?: string[];
        createdAt: string;
        isRead: boolean;
    };
    isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
    };

    return (
        <div className={cn(
            "flex gap-3 max-w-[80%]",
            isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
        )}>
            {/* Avatar */}
            <div className="shrink-0">
                {message.sender.avatar ? (
                    <Image
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold",
                        isOwn
                            ? "bg-gradient-to-br from-purple-500 to-pink-500"
                            : "bg-gradient-to-br from-blue-500 to-cyan-500"
                    )}>
                        {message.sender.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Message content */}
            <div className={cn(
                "flex flex-col",
                isOwn ? "items-end" : "items-start"
            )}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                        {message.sender.name}
                    </span>
                    {message.senderType === "admin" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                            Support
                        </span>
                    )}
                </div>

                <div className={cn(
                    "rounded-2xl px-4 py-2.5 [overflow-wrap:any-where]",
                    isOwn
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                        : "bg-white/10 text-white border border-white/10"
                )}>
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {message.attachments.map((url, index) => (
                            <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-400 hover:text-purple-300 underline"
                            >
                                Attachment {index + 1}
                            </a>
                        ))}
                    </div>
                )}

                <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.createdAt)}
                </span>
            </div>
        </div>
    );
}
