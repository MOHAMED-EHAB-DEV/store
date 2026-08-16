"use client";

import React, { useId, ComponentType, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  ariaLabel?: string;
  className?: string;
}

export interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }> | ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "card" | "compact" | "minimal";
  headingLevel?: "h2" | "h3" | "h4";
  role?: string;
}

export default function EmptyState({
  icon: IconOrNode,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  className,
  variant = "default",
  headingLevel: HeadingTag = "h3",
  role = "status",
}: EmptyStateProps) {
  const uniqueId = useId();
  const titleId = `empty-state-title-${uniqueId}`;
  const descId = `empty-state-desc-${uniqueId}`;

  const isCard = variant === "card";
  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";

  const renderAction = (action: EmptyStateAction, isPrimary: boolean) => {
    const ActionIcon = action.icon;
    const baseClasses =
      "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const variantClasses =
      action.variant === "outline"
        ? "border border-white/15 text-white hover:bg-white/10 hover:border-white/25"
        : action.variant === "secondary"
        ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
        : action.variant === "ghost"
        ? "text-neutral-400 hover:text-white hover:bg-white/5"
        : isPrimary
        ? "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10"
        : "border border-white/15 text-white hover:bg-white/10";

    const fullClass = cn(baseClasses, variantClasses, action.className);

    const content = (
      <>
        {ActionIcon && <ActionIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
        <span>{action.label}</span>
      </>
    );

    if (action.href) {
      return (
        <Link
          key={action.label}
          href={action.href}
          className={fullClass}
          aria-label={action.ariaLabel || action.label}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={action.label}
        type="button"
        onClick={action.onClick}
        className={fullClass}
        aria-label={action.ariaLabel || action.label}
      >
        {content}
      </button>
    );
  };

  return (
    <div
      role={role}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className={cn(
        "flex flex-col items-center text-center w-full",
        isCard &&
          "p-8 sm:p-12 rounded-3xl bg-[#0e1017]/60 border border-white/[0.08] backdrop-blur-xl shadow-2xl relative overflow-hidden",
        isCompact && "py-8 px-4",
        isMinimal && "py-6 px-2",
        !isCard && !isCompact && !isMinimal && "py-14 px-4 sm:px-6",
        className
      )}
    >
      {/* Icon */}
      {IconOrNode && (
        <div
          className={cn(
            "relative flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] text-neutral-400 shadow-inner mb-4",
            isCompact ? "w-12 h-12 mb-3" : "w-16 h-16 sm:w-20 sm:h-20"
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-2xl bg-purple-500/5 blur-md pointer-events-none" />
          {typeof IconOrNode === "function" ? (
            React.createElement(IconOrNode as ComponentType<{ className?: string }>, {
              className: isCompact ? "w-6 h-6 text-neutral-300" : "w-8 h-8 sm:w-10 sm:h-10 text-neutral-300",
            })
          ) : (
            IconOrNode
          )}
        </div>
      )}

      {/* Title */}
      {title && (
        <HeadingTag
          id={titleId}
          className={cn(
            "font-bold font-paras text-white tracking-tight mb-2",
            isCompact ? "text-base" : "text-lg sm:text-xl md:text-2xl"
          )}
        >
          {title}
        </HeadingTag>
      )}

      {/* Description */}
      {description && (
        <p
          id={descId}
          className={cn(
            "text-neutral-400 max-w-md mx-auto leading-relaxed",
            isCompact ? "text-xs mb-4" : "text-sm sm:text-base mb-6"
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction || children) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          {primaryAction && renderAction(primaryAction, true)}
          {secondaryAction && renderAction(secondaryAction, false)}
          {children}
        </div>
      )}
    </div>
  );
}
