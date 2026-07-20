"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: "right" | "bottom" | "left" | "top";
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Drawer = ({
  isOpen,
  onClose,
  direction = "right",
  children,
  className,
  backdropClassName,
}: DrawerProps) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mount / unmount the portal.
  // On close, if the panel never finished animating in (isVisible was still
  // false — e.g. isOpen flipped true->false within the same frame), there's
  // nothing to transition out, so unmount immediately instead of waiting
  // for a transitionend event that will never fire.
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      return;
    }
    setIsVisible((wasVisible) => {
      if (!wasVisible) setIsRendered(false);
      return false;
    });
  }, [isOpen]);

  // Trigger the enter animation once the panel exists in the DOM.
  // Double rAF = browser-guaranteed "initial state has painted" signal,
  // unlike a fixed setTimeout guess.
  useEffect(() => {
    if (!(isRendered && isOpen)) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIsVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isRendered, isOpen]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  // Native <dialog> handles focus trapping, Escape key, and restoring focus on close.
  // We manage the `.showModal()` call and `.close()` sync with our animations.
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isRendered && isOpen && !dialog.open) {
      dialog.showModal();
    }
  }, [isRendered, isOpen]);

  if (!mounted || !isRendered) return null;

  const baseClasses =
    "fixed bg-dark/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out";
  const positionClasses = {
    right: "top-0 end-0 h-dvh",
    bottom: "bottom-0 inset-x-0 w-full",
    left: "top-0 start-0 h-dvh",
    top: "top-0 inset-x-0 w-full",
  };

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0)";
    switch (direction) {
      case "right": return "translate3d(100%, 0, 0)";
      case "bottom": return "translate3d(0, 100%, 0)";
      case "left": return "translate3d(-100%, 0, 0)";
      case "top": return "translate3d(0, -100%, 0)";
      default: return "translate3d(100%, 0, 0)";
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className="m-0 p-0 bg-transparent border-none w-screen h-dvh max-w-none max-h-none focus:outline-none backdrop:bg-transparent"
      aria-modal="true"
      onCancel={(e) => {
        e.preventDefault(); // Prevent immediate native close
        onClose(); // Trigger our animated close
      }}
    >
      <div className="relative z-[9999999] w-full h-full flex" role="document">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className={cn(
            "fixed inset-0 w-screen h-dvh bg-black/40 backdrop-blur-lg transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0",
            backdropClassName
          )}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          ref={panelRef}
          className={cn(baseClasses, positionClasses[direction], className)}
          style={{ transform: getTransform() }}
          tabIndex={-1}
          onTransitionEnd={(e) => {
            // ignore bubbled transitions from children — only the panel's own
            // transform transition should trigger unmount
            if (e.target !== e.currentTarget) return;
            if (!isOpen) {
              dialogRef.current?.close();
              setIsRendered(false);
            }
          }}
        >
          {children}
        </div>
      </div>
    </dialog>,
    document.body
  );
};

export default Drawer;