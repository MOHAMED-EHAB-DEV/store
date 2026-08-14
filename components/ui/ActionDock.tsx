"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import CommandPalette from "./CommandPalette";

export default function ActionDock() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <CommandPalette isOpen={commandOpen} setIsOpen={setCommandOpen} />

      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 rounded-full bg-[#0e1017]/85 border border-white/15 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-white/25 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_16px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.25)] select-none"
        role="toolbar"
        aria-label="Quick Actions Dock"
      >
        {/* 1. Quick Search (Cmd+K) */}
        <button
          onClick={() => setCommandOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          aria-label="Search store (Press Cmd+K)"
        >
          <svg
            className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="font-semibold tracking-wide">Search</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white/10 rounded border border-white/10 group-hover:text-white group-hover:border-white/20">
            ⌘K
          </kbd>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-white/15 mx-0.5" aria-hidden="true" />

        {/* 2. Live Chat / Support */}
        <Link
          href="/support"
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          aria-label="Customer Support & Chat"
        >
          <svg
            className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-semibold tracking-wide">Support</span>
        </Link>

        {/* 3. Back to Top (Animated appearance) */}
        {showScrollTop && (
          <>
            <div className="h-4 w-px bg-white/15 mx-0.5" aria-hidden="true" />
            <button
              onClick={scrollToTop}
              className="group flex items-center justify-center p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
              aria-label="Scroll back to top"
            >
              <ChevronUp className="w-4 h-4 text-pink-400 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </>
        )}
      </div>
    </>
  );
}
