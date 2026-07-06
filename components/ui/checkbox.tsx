"use client"

import * as React from "react"
import { Check } from "@/components/ui/svgs/icons/Check";
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type" | "onChange" | "checked"> & {
    checked?: boolean | "indeterminate";
    onCheckedChange?: (checked: boolean) => void;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }
>(({ className, onCheckedChange, onChange, checked, ...props }, ref) => {
  const isChecked = checked === true;

  return (
    <div className="relative flex items-center justify-center size-4 shrink-0">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer m-0 appearance-none border-input dark:bg-input/30 checked:bg-primary checked:border-primary dark:checked:bg-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        checked={isChecked}
        onChange={(e) => {
          onCheckedChange?.(e.target.checked);
          onChange?.(e);
        }}
        {...props}
      />
      <Check className="pointer-events-none absolute size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
