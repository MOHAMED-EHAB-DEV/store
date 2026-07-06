"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useFloating } from "@/hooks/use-floating"
import { Check } from "@/components/ui/svgs/icons/Check";
import { Circle } from "@/components/ui/svgs/icons/Circle";
import { Slot } from "@/components/ui/slot"
import { cn } from "@/lib/utils"

type DropdownContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

function DropdownMenu({ children, open, onOpenChange, modal }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; modal?: boolean }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : uncontrolledOpen;
  
  const setIsOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) setUncontrolledOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [open, onOpenChange]);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef, contentRef }}>
      {children}
    </DropdownContext.Provider>
  )
}

function DropdownMenuTrigger({ asChild, className, onClick, ...props }: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
  
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

function DropdownMenuContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end"; sideOffset?: number; }) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

  const [mounted, setMounted] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    if (context.isOpen) {
      setShouldRender(true);
    } else {
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
      }}
      data-state={context.isOpen ? "open" : "closed"}
      data-lenis-prevent="true"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 min-w-32 overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

function DropdownMenuItem({ asChild, className, onClick, inset, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; inset?: boolean; variant?: "default" | "destructive" }) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuItem must be used within DropdownMenu");

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-inset={inset}
      data-variant={variant}
      onClick={(e: any) => {
        onClick?.(e);
        context.setIsOpen(false);
      }}
      className={cn(
        "focus:bg-white/10 transition-colors hover:bg-white/10 focus:text-white hover:text-white data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 dark:data-[variant=destructive]:hover:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:hover:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />
}

function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return <div data-inset={inset} className={cn("px-2 py-1.5 text-sm font-medium data-inset:pl-8", className)} {...props} />
}

function DropdownMenuGroup(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} /> }

function DropdownMenuPortal({ children }: { children: React.ReactNode }) { return <>{children}</> }

function DropdownMenuCheckboxItem({ className, children, checked, onClick, ...props }: React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }) {
  const context = React.useContext(DropdownContext);
  return (
    <div
      onClick={(e) => { onClick?.(e); context?.setIsOpen(false); }}
      className={cn("focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <Check className="size-4" />}
      </span>
      {children}
    </div>
  )
}

function DropdownMenuRadioGroup(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} /> }

function DropdownMenuRadioItem({ className, children, checked, onClick, ...props }: React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }) {
  const context = React.useContext(DropdownContext);
  return (
    <div
      onClick={(e) => { onClick?.(e); context?.setIsOpen(false); }}
      className={cn("focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <Circle className="size-2 fill-current" />}
      </span>
      {children}
    </div>
  )
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />
}

// Minimal un-implemented sub-menus to prevent breakages, since they are not used.
function DropdownMenuSub(props: any) { return <div {...props} /> }
function DropdownMenuSubTrigger(props: any) { return <div {...props} /> }
function DropdownMenuSubContent(props: any) { return <div {...props} /> }

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
