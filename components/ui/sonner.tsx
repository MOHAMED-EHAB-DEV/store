"use client"

import { Toaster as Sonner, toast as sonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const theme: ToasterProps["theme"] = "system"

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position={props.position ?? "bottom-right"}
      duration={props.duration ?? 5000}
      closeButton={props.closeButton ?? true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-high-contrast group-[.toaster]:border group-[.toaster]:shadow-lg",
          title: "toast-title",
          description: "toast-description",
          icon: "toast-icon",
          actionButton:
            "toast-actionButton",
          cancelButton:
            "toast-cancelButton",
          closeButton: 
            "close sonner-close"
        },
      }}
      {...props}
    />
  )
}

export { Toaster, sonnerToast }
export default Toaster
