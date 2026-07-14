"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: "right" | "bottom" | "left" | "top";
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
}

const Drawer = ({
  isOpen,
  onClose,
  direction = "right",
  children,
  className,
  backdropClassName,
}: DrawerProps) => {
  const [isRendered, setIsRendered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Accessibility: Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sync isOpen to isRendered to mount the portal
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    }
  }, [isOpen]);

  useGSAP(() => {
    if (!drawerRef.current || !backdropRef.current) return;

    const getInitialProps = () => {
      switch (direction) {
        case "right": return { x: "100%", y: 0 };
        case "bottom": return { y: "100%", x: 0 };
        case "left": return { x: "-100%", y: 0 };
        case "top": return { y: "-100%", x: 0 };
        default: return { x: "100%", y: 0 };
      }
    };

    const getFinalProps = () => {
      switch (direction) {
        case "right": return { x: 0, y: 0 };
        case "bottom": return { y: 0, x: 0 };
        case "left": return { x: 0, y: 0 };
        case "top": return { y: 0, x: 0 };
        default: return { x: 0, y: 0 };
      }
    };

    if (isOpen) {
      // Enter animation
      gsap.set(drawerRef.current, { ...getInitialProps(), opacity: 0 });
      gsap.set(backdropRef.current, { opacity: 0 });

      const tl = gsap.timeline();
      tl.to(drawerRef.current, {
        ...getFinalProps(),
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
      }, "<");
    } else if (isRendered) {
      // Exit animation
      const tl = gsap.timeline({
        onComplete: () => {
          setIsRendered(false);
        }
      });
      tl.to(drawerRef.current, {
        ...getInitialProps(),
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
      tl.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
      }, "<");
    }
  }, [isOpen, isRendered, direction]);

  if (!mounted || !isRendered) return null;

  const baseClasses = "fixed bg-dark/95 backdrop-blur-xl shadow-2xl";
  const positionClasses = {
    right: "top-0 end-0 h-screen",
    bottom: "bottom-0 inset-x-0 w-full",
    left: "top-0 start-0 h-screen",
    top: "top-0 inset-x-0 w-full",
  };

  return createPortal(
    <div className="relative z-[9999999]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className={cn("fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-lg", backdropClassName)}
        aria-hidden="true"
      ></div>

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={cn(baseClasses, positionClasses[direction], className)}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
