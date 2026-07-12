"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating } from "@/hooks/use-floating";
import { Check } from "@/components/ui/svgs/icons/Check";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { cn } from "@/lib/utils";

type SelectContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value?: string;
  onValueChange: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  displayValue: React.ReactNode;
  setDisplayValue: (node: React.ReactNode) => void;
};

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined,
);

function Select({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled,
}: {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const [displayValue, setDisplayValue] = React.useState<React.ReactNode>(null);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) setUncontrolledValue(newValue);
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <SelectContext.Provider
      value={{
        isOpen: disabled ? false : isOpen,
        setIsOpen,
        value,
        onValueChange: handleValueChange,
        triggerRef,
        contentRef,
        displayValue,
        setDisplayValue,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

function SelectGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-1 w-full", className)} {...props} />;
}

function SelectValue({ placeholder, ...props }: any) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  return (
    <span data-slot="select-value" {...props}>
      {context.value ? context.displayValue || context.value : placeholder}
    </span>
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "default";
}) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      ref={context.triggerRef as any}
      type="button"
      data-slot="select-trigger"
      data-size={size}
      data-state={context.isOpen ? "open" : "closed"}
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={cn(
        "border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 opacity-50" />
    </button>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  position?: "popper" | "item-aligned";
}) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

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
    align: "start",
    sideOffset: 4,
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
      data-side="bottom"
      data-lenis-prevent="true"
      className={cn(
        "bg-popover text-popover-foreground relative z-50 max-h-96 min-w-32 overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1",
        className,
      )}
      {...props}
    >
      <div className={cn("p-1 w-full")}>{children}</div>
    </div>,
    document.body,
  );
}

function SelectLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-label"
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-xs font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const isSelected = context.value === value;

  React.useEffect(() => {
    if (isSelected) context.setDisplayValue(children);
  }, [isSelected, children, context]);

  return (
    <div
      data-slot="select-item"
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        context.onValueChange(value);
        context.setIsOpen(false);
      }}
      className={cn(
        "focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white dark:hover:bg-white/10 dark:hover:text-white [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        {isSelected && <Check className="size-4" />}
      </span>
      <span>{children}</span>
    </div>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton() {
  return null;
}
function SelectScrollDownButton() {
  return null;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
