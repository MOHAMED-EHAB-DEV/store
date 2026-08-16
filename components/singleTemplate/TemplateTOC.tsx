"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { BookOpen } from "@/components/ui/svgs/icons/BookOpen";
import { cn } from "@/lib/utils";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TemplateTOCProps {
  headings: Heading[];
}

export default function TemplateTOC({ headings }: TemplateTOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [pinMode, setPinMode] = useState<"top" | "fixed" | "bottom">("top");
  const [tocCoords, setTocCoords] = useState<{ left: number; width: number }>({
    left: 0,
    width: 288,
  });
  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number;
    height: number;
    trackHeight: number;
  }>({
    top: 14,
    height: 0,
    trackHeight: 0,
  });

  const isClickingRef = useRef(false);
  const placeholderRef = useRef<HTMLElement>(null);
  const tocBoxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rafRef = useRef<number | null>(null);

  // High-precision scroll position calculation for exact top/fixed/bottom pinning
  const updatePinPosition = useCallback(() => {
    const placeholder = placeholderRef.current;
    const tocBox = tocBoxRef.current;
    if (!placeholder || !tocBox) return;

    const parentContainer = placeholder.parentElement;
    if (!parentContainer) return;

    const navbarOffset = 100; // Top offset below the fixed floating navbar
    const containerRect = parentContainer.getBoundingClientRect();
    const placeholderRect = placeholder.getBoundingClientRect();
    const tocHeight = tocBox.offsetHeight;

    setTocCoords({
      left: placeholderRect.left,
      width: placeholderRect.width,
    });

    if (containerRect.top > navbarOffset) {
      setPinMode("top");
    } else if (containerRect.bottom < navbarOffset + tocHeight) {
      setPinMode("bottom");
    } else {
      setPinMode("fixed");
    }
  }, []);

  // Continuous real-time scroll progress mapped to physical TOC heading positions.
  const updateScrollProgress = useCallback(() => {
    if (!headings || headings.length === 0) return;

    const list = listRef.current;
    if (!list) return;

    const liElements = list.querySelectorAll("li");
    if (liElements.length === 0) return;

    const firstLi = liElements[0];
    const lastLi = liElements[liElements.length - 1];
    const startY = firstLi.offsetTop + firstLi.offsetHeight / 2;
    const endY = lastLi.offsetTop + lastLi.offsetHeight / 2;
    const trackHeight = Math.max(0, endY - startY);

    // Dynamic threshold: section activation line in viewport (around 160px or upper quarter)
    const threshold = Math.min(220, Math.max(120, window.innerHeight * 0.25));

    const headingElements = headings.map((h) => document.getElementById(h.id));

    // Check if scrolled near the bottom of the page or past the markdown container
    const isPageBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 50;

    const parentContainer = placeholderRef.current?.parentElement;
    const containerRect = parentContainer?.getBoundingClientRect();
    const isSectionPassed = containerRect
      ? containerRect.bottom <= threshold + 50
      : false;

    let currentIdx = 0;
    let ratio = 0;

    if (isPageBottom || isSectionPassed) {
      currentIdx = headings.length - 1;
      ratio = 1;
    } else {
      let foundActive = false;
      for (let i = 0; i < headingElements.length; i++) {
        const el = headingElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            currentIdx = i;
            foundActive = true;
          } else {
            break;
          }
        }
      }

      if (!foundActive) {
        currentIdx = 0;
        ratio = 0;
      } else if (currentIdx < headings.length - 1) {
        const currentEl = headingElements[currentIdx];
        const nextEl = headingElements[currentIdx + 1];

        if (currentEl && nextEl) {
          const currentTop = currentEl.getBoundingClientRect().top;
          const nextTop = nextEl.getBoundingClientRect().top;
          const span = nextTop - currentTop;
          if (span > 0) {
            ratio = Math.min(1, Math.max(0, (threshold - currentTop) / span));
          }
        }
      } else if (currentIdx === headings.length - 1) {
        const lastEl = headingElements[currentIdx];
        if (lastEl) {
          const lastTop = lastEl.getBoundingClientRect().top;
          ratio = Math.min(1, Math.max(0, (threshold - lastTop) / 250));
        } else {
          ratio = 1;
        }
      }
    }

    const currentLi = liElements[currentIdx] || firstLi;
    const nextIdx = Math.min(headings.length - 1, currentIdx + 1);
    const nextLi = liElements[nextIdx] || currentLi;

    const currentY = currentLi.offsetTop + currentLi.offsetHeight / 2;
    const nextY = nextLi.offsetTop + nextLi.offsetHeight / 2;
    const interpolatedY = currentY + (nextY - currentY) * ratio;
    const fillHeight = Math.max(
      0,
      Math.min(trackHeight, interpolatedY - startY)
    );

    setIndicatorStyle({
      top: startY,
      height: fillHeight,
      trackHeight,
    });

    if (!isClickingRef.current) {
      setActiveId(headings[currentIdx]?.id || headings[0].id);
    }
  }, [headings]);

  useEffect(() => {
    updatePinPosition();
    updateScrollProgress();

    // rAF-throttled scroll and resize handler
    const handleScrollAndResize = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        updatePinPosition();
        updateScrollProgress();
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScrollAndResize, { passive: true });
    window.addEventListener("resize", handleScrollAndResize, { passive: true });
    window.addEventListener("load", handleScrollAndResize);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(handleScrollAndResize);
    }

    return () => {
      window.removeEventListener("scroll", handleScrollAndResize);
      window.removeEventListener("resize", handleScrollAndResize);
      window.removeEventListener("load", handleScrollAndResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updatePinPosition, updateScrollProgress]);

  if (!headings || headings.length === 0) return null;

  const activeIndex = Math.max(
    0,
    headings.findIndex((h) => h.id === activeId)
  );

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    isClickingRef.current = true;
    setActiveId(id);

    const target = document.getElementById(id);
    if (target) {
      const topOffset = 115;
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - topOffset;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      history.pushState(null, "", `#${id}`);

      setTimeout(() => {
        isClickingRef.current = false;
        updateScrollProgress();
      }, 700);
    }
  };

  const getDynamicStyle = (): React.CSSProperties => {
    if (pinMode === "fixed") {
      return {
        position: "fixed",
        top: "100px",
        left: `${tocCoords.left}px`,
        width: `${tocCoords.width}px`,
        zIndex: 30,
      };
    }

    if (pinMode === "bottom") {
      return {
        position: "absolute",
        bottom: "0px",
        left: "0px",
        right: "0px",
        zIndex: 30,
      };
    }

    return {
      position: "relative",
      top: "0px",
      zIndex: 30,
    };
  };

  return (
    <aside
      ref={placeholderRef}
      aria-label="Table of Contents"
      className="hidden lg:block w-72 shrink-0 relative self-stretch"
    >
      <div
        ref={tocBoxRef}
        style={getDynamicStyle()}
        className="p-5 rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-2xl shadow-xl space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-2 pb-1 text-white">
          <BookOpen className="w-4 h-4 text-purple-400" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-300">
            On This Page
          </span>
          <span className="ms-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {activeIndex + 1} / {headings.length}
          </span>
        </div>

        {/* Heading Links List with Section-Aligned Status Progress Bar */}
        <nav className="relative">
          {/* Background Status Track matching physical dot centers */}
          <div
            aria-hidden="true"
            className="absolute start-[10px] w-0.5 bg-white/10 rounded-full pointer-events-none transition-[height] duration-75 ease-out"
            style={{
              top: `${indicatorStyle.top}px`,
              height: `${indicatorStyle.trackHeight}px`,
            }}
          >
            {/* Live Continuous Animated Status Progress Fill */}
            <div
              className="relative w-full bg-gradient-to-b from-purple-400 via-pink-400 to-cyan-400 rounded-full transition-[height] duration-75 ease-out shadow-[0_0_10px_rgba(168,85,247,0.9)]"
              style={{ height: `${indicatorStyle.height}px` }}
            >
              {/* Glowing Active Leading Tip */}
              {indicatorStyle.height > 0 &&
                indicatorStyle.height < indicatorStyle.trackHeight && (
                  <div className="absolute -bottom-1 start-1/2 -translate-x-1/2 size-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                )}
            </div>
          </div>

          <ul ref={listRef} className="text-sm relative space-y-1">
            {headings.map((heading, idx) => {
              const isActive = activeId === heading.id;
              const isPassed = idx <= activeIndex;
              const isSubHeading = heading.level > 2;

              return (
                <li key={heading.id} className="relative">
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleLinkClick(e, heading.id)}
                    className={cn(
                      "group flex items-center gap-2.5 py-1.5 pe-2 rounded-lg transition-all duration-300 text-start leading-snug",
                      isSubHeading ? "ps-7 text-xs" : "ps-6 text-sm",
                      isActive
                        ? "text-purple-300 font-semibold bg-purple-500/15 shadow-xs"
                        : isPassed
                        ? "text-gray-200 font-medium hover:bg-white/[0.04]"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                    )}
                  >
                    {/* Active Status Indicator Dot */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute start-[7px] top-1/2 -translate-y-1/2 size-2 rounded-full transition-all duration-300 ease-out",
                        isActive
                          ? "bg-purple-400 scale-105 shadow-[0_0_12px_rgba(168,85,247,1)] ring-2 ring-purple-400/40"
                          : isPassed
                          ? "bg-purple-400/90 shadow-[0_0_6px_rgba(168,85,247,0.7)] scale-105"
                          : "bg-white/20 group-hover:bg-white/50 scale-90"
                      )}
                    />
                    <span className="truncate">{heading.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}