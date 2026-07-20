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

export const ModalOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { show?: boolean }>(
  ({ className, show, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ease-out",
        show ? "opacity-100" : "opacity-0",
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
  const [render, setRender] = React.useState(open);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setRender(true);
      // Slight delay to ensure DOM is ready before triggering transition
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
      document.body.style.overflow = "hidden";
    } else {
      setShow(false);
      document.body.style.overflow = "";
      const timeout = setTimeout(() => setRender(false), 200); // match duration
      return () => clearTimeout(timeout);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!render) return null;

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
      <dialog
        ref={(el) => {
          if (el && !el.open) {
            el.showModal();
          }
        }}
        onCancel={(e) => {
          e.preventDefault();
          onOpenChange?.(false);
        }}
        className="m-0 p-0 bg-transparent border-none w-screen h-dvh max-w-none max-h-none focus:outline-none backdrop:bg-transparent"
        aria-modal="true"
      >
        <ModalOverlay show={show} onClick={() => onOpenChange?.(false)} />
        <div
          ref={ref}
          role="document"
          className={cn(
            "fixed left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg",
            "transition-all duration-200",
            show 
              ? "opacity-100 scale-100 top-[50%] ease-[cubic-bezier(0.175,0.885,0.32,1.15)]" 
              : "opacity-0 scale-95 top-[52%] ease-in",
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
      </dialog>
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
