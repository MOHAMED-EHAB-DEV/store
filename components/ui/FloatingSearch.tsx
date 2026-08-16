"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { GlobalSearchItems, GlobalSearchItem, getLiveSearchItems } from "@/constants/search";

const CommandPalette = dynamic(() => import("./CommandPalette"), {
  ssr: false,
});

function getSearchIcon(name: GlobalSearchItem["iconName"]) {
  switch (name) {
    case "templates":
      return (
        <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "folder":
      return (
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case "code":
      return (
        <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case "pricing":
      return (
        <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "blog":
    case "article":
      return (
        <svg className="w-3.5 h-3.5 text-pink-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "faq":
      return (
        <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "support":
      return (
        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default function FloatingSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const isInlineExpandMode = pathname === "/" || pathname === "/custom-development";

  const [items, setItems] = useState<GlobalSearchItem[]>(GlobalSearchItems);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [shortcutText, setShortcutText] = useState("⌘K");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // OS detection for dynamic shortcut badge
  useEffect(() => {
    const isMac =
      typeof window !== "undefined" &&
      navigator.platform?.toUpperCase().indexOf("MAC") >= 0;
    setShortcutText(isMac ? "⌘K" : "Ctrl K");
  }, []);

  // Lazy fetch search items on user interaction
  const loadSearchData = useCallback(() => {
    setIsLoading(true);
    getLiveSearchItems()
      .then((data) => {
        setItems(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Global Ctrl+K / Cmd+K keydown trigger
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        loadSearchData();
        if (isInlineExpandMode) {
          inputRef.current?.focus();
          setIsFocused(true);
        } else {
          setModalOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isInlineExpandMode, loadSearchData]);

  // Click outside listener to dismiss popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (url: string) => {
      setIsFocused(false);
      setIsHovered(false);
      setQuery("");
      router.push(url);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isInlineExpandMode) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].url);
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const isExpanded = isInlineExpandMode && (isHovered || isFocused || query.length > 0);

  return (
    <>
      {modalOpen && (
        <CommandPalette
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          initialItems={items}
        />
      )}

      <div
        ref={containerRef}
        onMouseEnter={() => {
          if (isInlineExpandMode) {
            setIsHovered(true);
            loadSearchData();
          }
        }}
        onMouseLeave={() => isInlineExpandMode && setIsHovered(false)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40"
      >
        {/* Autocomplete Popover */}
        {isInlineExpandMode && isFocused && (
          <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-72 sm:w-80 max-h-64 overflow-y-auto rounded-2xl bg-[#0e1017]/90 border border-white/15 backdrop-blur-2xl p-1.5 text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
            {isLoading && items.length === 0 ? (
              <div className="p-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] animate-pulse">
                    <div className="h-3 w-28 rounded bg-white/10" />
                    <div className="h-3 w-10 rounded bg-white/5" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-4 px-2 text-center text-xs text-gray-400">
                No matches found
              </div>
            ) : (
              filtered.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    selectedIndex === index
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getSearchIcon(item.iconName)}
                    <span className="font-medium text-xs truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400 shrink-0">
                    {item.category}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Floating Glass Pill Bar */}
        <div
          onClick={() => {
            loadSearchData();
            if (!isInlineExpandMode) {
              setModalOpen(true);
            } else {
              inputRef.current?.focus();
            }
          }}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/15 hover:border-white/30 backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
            isExpanded
              ? "w-72 sm:w-80 border-white/35 bg-white/[0.10]"
              : "w-40 sm:w-48"
          }`}
        >
          {/* Glassy Search Icon / Loading Spinner */}
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 border border-white/15 text-white/80 shrink-0" aria-hidden="true">
            {isLoading ? (
              <svg className="w-3 h-3 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-white/90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>

          {/* Interactive Input (Home & Custom Dev) vs Button Text (Other Pages) */}
          {isInlineExpandMode ? (
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                loadSearchData();
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-white text-xs font-medium placeholder-gray-400 focus:outline-none"
            />
          ) : (
            <span className="w-full text-xs font-medium text-gray-300 truncate select-none">
              Search...
            </span>
          )}

          {/* Dynamic OS Shortcut Badge */}
          <kbd className="shrink-0 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-white/70 bg-white/10 rounded-md border border-white/15 select-none">
            {shortcutText}
          </kbd>
        </div>
      </div>
    </>
  );
}
