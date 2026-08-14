"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "@/components/ui/svgs/icons/ExternalLink";
import DownloadBtn from "./DownloadBtn";

interface StickyBarProps {
  templateId: string;
  title: string;
  price: number;
  demoLink: string;
}

export default function StickyPurchaseBar({
  templateId,
  title,
  price,
  demoLink,
}: StickyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 400px
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl p-3 sm:p-4 rounded-2xl glass-strong border border-white/15 shadow-2xl backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-white truncate font-paras">
              {title}
            </h4>
            <span className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              {price === 0 ? "Free Template" : `$${price}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {demoLink && (
            <Link
              href={demoLink}
              target="_blank"
              aria-label={`Live demo for ${title}`}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/30 text-white text-xs sm:text-sm font-semibold transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Demo</span>
            </Link>
          )}
          <DownloadBtn
            templateId={templateId}
            isFree={price === 0}
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-purple-500/25 transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}
