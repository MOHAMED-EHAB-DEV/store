"use client";

import React from "react";
import SharedEmptyState, { EmptyStateAction } from "@/components/shared/EmptyState";

export type { EmptyStateAction };

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    className?: string;
  };
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "card" | "compact" | "minimal";
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  className,
  variant,
}: EmptyStateProps) {
  return (
    <SharedEmptyState
      icon={icon}
      title={title}
      description={description}
      primaryAction={action}
      className={className}
      variant={variant}
    >
      {children}
    </SharedEmptyState>
  );
}
