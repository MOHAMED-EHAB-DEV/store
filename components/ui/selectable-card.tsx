"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "@/components/ui/svgs/icons/Check";

export interface SelectableCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
}

const SelectableCard = forwardRef<HTMLButtonElement, SelectableCardProps>(
  ({ className, label, description, checked, onClick, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        onClick={onClick}
        className={cn(
          "relative flex items-center justify-between p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 outline-none",
          "focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500",
          checked
            ? "border-purple-500 bg-purple-500/20 text-white shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]"
            : "border-white/10 bg-black/40 text-gray-400 hover:border-white/30 hover:bg-white/5",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1 select-none pr-4">
          <span className="font-medium text-sm">{label}</span>
          {description && <span className="text-xs text-gray-500">{description}</span>}
        </div>
        <div
          className={cn(
            "w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors shrink-0",
            checked ? "border-purple-400 bg-purple-500" : "border-gray-600 bg-transparent group-hover:border-gray-400"
          )}
        >
          <Check 
            className={cn(
              "w-3.5 h-3.5 text-white transition-transform duration-300",
              checked ? "scale-100" : "scale-0"
            )} 
          />
        </div>
      </button>
    );
  }
);
SelectableCard.displayName = "SelectableCard";

export { SelectableCard };
