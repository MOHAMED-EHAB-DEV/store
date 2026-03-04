"use client";

import React from "react";
import { MoreVertical } from "@/components/ui/svgs/icons/MoreVertical";
import { Edit } from "@/components/ui/svgs/icons/Edit";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface ActionItem {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: "default" | "destructive";
    separator?: boolean;
}

interface ActionDropdownProps {
    actions?: ActionItem[];
    customActions?: React.ReactNode;
}

export default function ActionDropdown({
    actions,
    customActions,
}: ActionDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/10"
                >
                    <MoreVertical className="w-4 h-4 text-white" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-dark border-white/10">
                {customActions}
                {actions?.map((action, index) => (
                    <React.Fragment key={index}>
                        {action.separator && <DropdownMenuSeparator className="bg-white/10" />}
                        <DropdownMenuItem
                            onClick={action.onClick}
                            className={`flex items-center gap-2 cursor-pointer ${action.variant === "destructive"
                                    ? "text-red-400 hover:bg-red-500/10"
                                    : "text-white hover:bg-white/10"
                                }`}
                        >
                            {action.icon && <action.icon className="w-4 h-4" />}
                            <span>{action.label}</span>
                        </DropdownMenuItem>
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Common action presets
export const createDefaultActions = (defaultActions: {
    onView?: () => void,
    onEdit?: () => void,
    onDelete?: () => void
}): ActionItem[] => {
    const actions: ActionItem[] = [];

    if (defaultActions.onView) {
        actions.push({
            label: "View",
            icon: Eye,
            onClick: defaultActions.onView,
        });
    }

    if (defaultActions.onEdit) {
        actions.push({
            label: "Edit",
            icon: Edit,
            onClick: defaultActions.onEdit,
        });
    }

    if (defaultActions.onDelete) {
        actions.push({
            label: "Delete",
            icon: Trash2,
            onClick: defaultActions.onDelete,
            variant: "destructive",
            separator: true,
        });
    }

    return actions;
};
