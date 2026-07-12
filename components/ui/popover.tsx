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
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (context.isOpen) {
      setShouldRender(true);
      let raf2: number;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    } else {
      setVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 150);
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
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : "scale(0.97) translateY(-4px)",
        transition: "opacity 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        transformOrigin: "top center",
      }}
      data-state={context.isOpen ? "open" : "closed"}
      data-lenis-prevent="true"
      className={cn(
        "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none",
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
