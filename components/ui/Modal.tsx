"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "@/components/ui/svgs/icons/X";
import { cn } from "@/lib/utils";

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const ModalContext = React.createContext<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>({});

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <ModalContext.Provider value={{ open, onOpenChange }}>
      {children}
    </ModalContext.Provider>
  );
}

export const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

export const ModalOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
);
ModalOverlay.displayName = "ModalOverlay";

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    showCloseButton?: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  }
>(({ className, children, showCloseButton = true, size = "lg", ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(ModalContext);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    "6xl": "sm:max-w-6xl",
    "7xl": "sm:max-w-7xl",
    "full": "sm:max-w-full",
  };

  return (
    <ModalPortal>
      <ModalOverlay data-state={open ? "open" : "closed"} onClick={() => onOpenChange?.(false)} />
      <div
        ref={ref}
        role="dialog"
        data-state={open ? "open" : "closed"}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <button
            onClick={() => onOpenChange?.(false)}
            className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </ModalPortal>
  );
});
ModalContent.displayName = "ModalContent";

export const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
);
ModalHeader.displayName = "ModalHeader";

export const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
ModalFooter.displayName = "ModalFooter";

export const ModalTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none", className)} {...props} />
  )
);
ModalTitle.displayName = "ModalTitle";

export const ModalDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
ModalDescription.displayName = "ModalDescription";
