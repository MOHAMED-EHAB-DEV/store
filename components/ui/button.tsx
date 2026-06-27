import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-white/10 hover:text-white dark:bg-input/30 dark:border-input dark:hover:bg-white/10 dark:hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-white/10 hover:text-white dark:hover:bg-white/10 dark:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gold text-gold-foreground hover:bg-gold/90 focus-visible:ring-gold/20",
        glass: "bg-glass text-white border border-glass-border hover:bg-white/10 focus-visible:ring-white/20",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500/20 dark:bg-green-600/80 dark:hover:bg-green-600",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500/20 dark:bg-yellow-600/80 dark:hover:bg-yellow-600",
        info: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/20 dark:bg-blue-600/80 dark:hover:bg-blue-600",
        dark: "bg-dark text-white border border-white/10 hover:bg-white/5 focus-visible:ring-white/20",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent/20",
        "gradient-primary": "bg-[image:var(--gradient-primary)] text-white hover:opacity-90 transition-opacity focus-visible:ring-indigo-500/20",
        "gradient-secondary": "bg-[image:var(--gradient-secondary)] text-white hover:opacity-90 transition-opacity focus-visible:ring-pink-500/20",
        "gradient-success": "bg-[image:var(--gradient-success)] text-white hover:opacity-90 transition-opacity focus-visible:ring-emerald-500/20",
        "gradient-warning": "bg-[image:var(--gradient-warning)] text-white hover:opacity-90 transition-opacity focus-visible:ring-teal-500/20",
        "gradient-danger": "bg-[image:var(--gradient-danger)] text-white hover:opacity-90 transition-opacity focus-visible:ring-red-500/20",
        "gradient-info": "bg-[image:var(--gradient-info)] text-white hover:opacity-90 transition-opacity focus-visible:ring-cyan-500/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
