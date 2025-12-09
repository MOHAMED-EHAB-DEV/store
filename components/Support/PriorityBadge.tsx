"use client";

import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
    priority: "low" | "medium" | "high" | "urgent";
    size?: "sm" | "md";
}

const priorityConfig = {
    low: {
        label: "Low",
        className: "bg-slate-500/20 text-slate-400 border-slate-500/30"
    },
    medium: {
        label: "Medium",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },
    high: {
        label: "High",
        className: "bg-orange-500/20 text-orange-400 border-orange-500/30"
    },
    urgent: {
        label: "Urgent",
        className: "bg-red-500/20 text-red-400 border-red-500/30"
    }
};

export default function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
    const config = priorityConfig[priority];

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
