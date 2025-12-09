"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: "open" | "resolved" | "closed";
    size?: "sm" | "md";
}

const statusConfig = {
    open: {
        label: "Open",
        className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    },
    resolved: {
        label: "Resolved",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    closed: {
        label: "Closed",
        className: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={cn(
            "inline-flex items-center rounded-full border font-medium",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
            config.className
        )}>
            {config.label}
        </span>
    );
}
