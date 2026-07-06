"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useFloating } from "@/hooks/use-floating"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

type PopoverContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

function Popover({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : uncontrolledOpen;
  
  const setIsOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) setUncontrolledOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [open, onOpenChange]);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef, contentRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({ asChild, className, onClick, ...props }: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within Popover");
  
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={context.triggerRef as any}
      onClick={(e: any) => {
        context.setIsOpen(!context.isOpen);
        onClick?.(e);
      }}
      className={className}
      data-state={context.isOpen ? "open" : "closed"}
      {...props}
    />
  )
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end"; sideOffset?: number; }) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within Popover");

  const [mounted, setMounted] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (context.isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 150); // allow animate-out to play
      return () => clearTimeout(timer);
    }
  }, [context.isOpen]);

  const { updatePosition } = useFloating({
    isOpen: context.isOpen,
    setIsOpen: context.setIsOpen,
    triggerRef: context.triggerRef,
    contentRef: context.contentRef,
    align,
    sideOffset,
  });

  if (!shouldRender || !mounted) return null;

  return createPortal(
    <div
      ref={(node) => {
        context.contentRef.current = node;
        if (node && context.isOpen) {
          requestAnimationFrame(() => updatePosition());
        }
      }}
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
      }}
      data-state={context.isOpen ? "open" : "closed"}
      data-lenis-prevent="true"
      className={cn(
        "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

function PopoverAnchor(props: any) {
  return <div {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
