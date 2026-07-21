"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import { cn } from "@/lib/utils";

interface ShowMoreTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  buttonClassName?: string;
  showMoreLabel?: string;
  showLessLabel?: string;
}

export default function ShowMoreText({
  text,
  maxLength = 180,
  className,
  buttonClassName,
  showMoreLabel = "Show more",
  showLessLabel = "Show less",
}: ShowMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const isLongText = text.length > maxLength;
  const displayText =
    isLongText && !isExpanded ? `${text.slice(0, maxLength).trim()}...` : text;

  return (
    <div className="space-y-2">
      <p className={cn("text-gray-400 text-lg leading-relaxed max-w-3xl", className)}>
        {displayText}
      </p>
      {isLongText && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 focus:outline-none transition-colors cursor-pointer",
            buttonClassName
          )}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? showLessLabel : showMoreLabel}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
