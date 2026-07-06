"use client"

import * as React from "react"
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { cn } from "@/lib/utils"

type AccordionContextValue = {
  value: string | undefined;
  onValueChange: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

const Accordion = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}>(({ className, type = "single", collapsible = true, defaultValue, value: controlledValue, onValueChange, ...props }, ref) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback((newValue: string) => {
    if (type === "single") {
      const nextValue = value === newValue && collapsible ? undefined : newValue;
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue as string);
    }
  }, [type, collapsible, value, isControlled, onValueChange]);

  return (
    <AccordionContext.Provider value={{ value: value as string, onValueChange: handleValueChange }}>
      <div ref={ref} className={className} data-orientation="vertical" {...props} />
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItemContext = React.createContext<{ value: string; state: "open" | "closed" } | undefined>(undefined);

const AccordionItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error("AccordionItem must be used within Accordion");
    const state = context.value === value ? "open" : "closed";

    return (
      <AccordionItemContext.Provider value={{ value, state }}>
        <div
          ref={ref}
          data-state={state}
          className={cn("border-b border-purple-200 dark:border-purple-800", className)}
          {...props}
        />
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const itemContext = React.useContext(AccordionItemContext);
    const rootContext = React.useContext(AccordionContext);
    if (!itemContext || !rootContext) throw new Error("AccordionTrigger must be used within AccordionItem");

    return (
      <h3 className="flex">
        <button
          ref={ref}
          type="button"
          data-state={itemContext.state}
          aria-expanded={itemContext.state === "open"}
          onClick={() => rootContext.onValueChange(itemContext.value)}
          className={cn(
            "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:text-purple-600 dark:hover:text-purple-400 [&[data-state=open]>svg]:rotate-180",
            className
          )}
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 shrink-0 text-purple-500 transition-transform duration-200" />
        </button>
      </h3>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const itemContext = React.useContext(AccordionItemContext);
    if (!itemContext) throw new Error("AccordionContent must be used within AccordionItem");

    const isOpen = itemContext.state === "open";

    return (
      <div
        ref={ref}
        data-state={itemContext.state}
        className={cn(
          "grid transition-all duration-200 ease-in-out text-sm",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        {...props}
      >
        <div className="overflow-hidden">
          <div className={cn("pb-4 pt-0", className)}>{children}</div>
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }