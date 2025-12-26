"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {Icon && (
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-md mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick} className="bg-primary hover:bg-primary/90">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
