import * as React from "react"
import { Slot } from "@/components/ui/slot"
import { cva } from "@/lib/variants"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-white/10 [a&]:hover:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeVariants = {
  variant?: "default" | "secondary" | "destructive" | "outline";
};

const badgeVariantsFunction = badgeVariants as unknown as (props?: BadgeVariants & { className?: string }) => string;

const Badge = React.forwardRef<HTMLElement, React.ComponentProps<"span"> & BadgeVariants & { asChild?: boolean }>(({
  className,
  variant,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariantsFunction({ variant, className }))}
      ref={ref}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge, badgeVariantsFunction as badgeVariants }
