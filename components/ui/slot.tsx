import * as React from "react"
import { cn } from "@/lib/utils"

export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      return React.cloneElement(children, {
        ...props,
        ...childProps,
        ref: (node: any) => {
          // Merge refs if necessary, but for simplicity we just assign the forwarded ref here
          // Usually you'd merge them, but this is a minimal custom slot implementation.
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as any).current = node;
          }
          
          const childRef = (children as any).ref;
          if (typeof childRef === "function") {
            childRef(node);
          } else if (childRef) {
            childRef.current = node;
          }
        },
        className: cn(props.className, (children.props as any).className),
      } as any)
    }
    return <span {...props}>{children}</span>
  }
)
Slot.displayName = "Slot"
