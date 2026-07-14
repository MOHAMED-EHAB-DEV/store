import { useEffect, useCallback, RefObject } from "react";

export function useFloating<T extends HTMLElement = HTMLElement, C extends HTMLElement = HTMLElement>({
  isOpen,
  setIsOpen,
  triggerRef,
  contentRef,
  align = "center",
  sideOffset = 4,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: RefObject<T | null>;
  contentRef: RefObject<C | null>;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current || !isOpen) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    const intrinsicHeight = contentRef.current.scrollHeight;
    
    const availableBelow = window.innerHeight - triggerRect.bottom - sideOffset - 10;
    const availableAbove = triggerRect.top - sideOffset - 10;

    let top = triggerRect.bottom + sideOffset + window.scrollY;
    let left = triggerRect.left + window.scrollX;
    let maxHeight = availableBelow;

    if (align === "center") {
      left = left + triggerRect.width / 2 - contentRect.width / 2;
    } else if (align === "end") {
      left = left + triggerRect.width - contentRect.width;
    }

    if (left < 10) left = 10;
    if (left + contentRect.width > window.innerWidth - 10) {
      left = window.innerWidth - contentRect.width - 10;
    }

    if (intrinsicHeight > availableBelow && availableAbove > availableBelow) {
      const finalHeight = Math.min(intrinsicHeight, availableAbove);
      top = triggerRect.top - finalHeight - sideOffset + window.scrollY;
      maxHeight = availableAbove;
    }

    // Direct DOM Mutation for high-performance zero-lag positioning
    Object.assign(contentRef.current.style, {
      position: "absolute",
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${triggerRect.width}px`, // Ensures popups are at least as wide as triggers
      maxHeight: `${maxHeight}px`,
      overflowY: "auto",
      overscrollBehavior: "contain"
    });
  }, [isOpen, align, sideOffset, triggerRef, contentRef]);

  useEffect(() => {
    if (isOpen) {
      let frameCount = 0;
      let rafId: number;
      
      // Polling for the first few frames to ensure the DOM node is painted before we measure
      const checkAndPosition = () => {
        if (contentRef.current && triggerRef.current) {
          updatePosition();
          if (frameCount < 3) {
            frameCount++;
            rafId = requestAnimationFrame(checkAndPosition);
          }
        } else if (frameCount < 10) {
          frameCount++;
          rafId = requestAnimationFrame(checkAndPosition);
        }
      };
      
      rafId = requestAnimationFrame(checkAndPosition);
      
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [isOpen, updatePosition, contentRef, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        contentRef.current && 
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen, contentRef, triggerRef]);

  return { updatePosition };
}
