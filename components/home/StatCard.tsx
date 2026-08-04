"use client";

import { ComponentType } from "react";

export interface StatConfig {
  id: "templates" | "customers" | "downloads" | "rating";
  label: string;
  cachedValue: number;
  channel?: string;
  suffix?: string;
  decimals?: number;
  icon: ComponentType<{ className?: string }>;
}

interface StatCardProps {
  config: StatConfig;
  displayRef: (el: HTMLSpanElement | null) => void;
  cardRef: (el: HTMLDivElement | null) => void;
  index?: number;
}

export default function StatCard({
  config,
  displayRef,
  cardRef,
  index = 0,
}: StatCardProps) {
  const Icon = config.icon;
  const decimals = config.decimals ?? 0;

  // Initial SSR-rendered string so crawlers get real value in HTML immediately (Phase 1)
  const formattedInitial =
    decimals > 0
      ? config.cachedValue.toFixed(decimals)
      : Math.round(config.cachedValue).toLocaleString("en-US");

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl bg-neutral-900/40 backdrop-blur-xl p-6 md:p-7 border border-white/10 hover:border-cyan-500/40 hover:bg-neutral-900/70 transition-all duration-300 shadow-xl flex flex-col justify-between"
    >
      {/* Top Hairline Laser Accent */}
      <div
        className="absolute top-0 start-0 h-[2px] w-0 bg-linear-to-r from-cyan-400 via-purple-500 to-transparent group-hover:w-full transition-all duration-500 pointer-events-none"
        aria-hidden="true"
      />

      {/* Header: Index & Icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-cyan-400/80 tracking-widest font-semibold">
          0{index + 1} //
        </span>
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric */}
      <div className="text-4xl md:text-5xl font-extralight text-white tracking-tighter my-2 flex items-baseline gap-1">
        {/* Real number in HTML markup on first byte (Phase 1). GSAP will tween displayRef textContent (Phase 2 & 3). */}
        <span ref={displayRef}>{formattedInitial}</span>
        {config.suffix && (
          <span className="text-cyan-400 font-normal text-2xl md:text-3xl ms-0.5">
            {config.suffix}
          </span>
        )}
      </div>

      {/* Label */}
      <div className="text-xs uppercase tracking-widest font-semibold text-neutral-400 mt-1">
        {config.label}
      </div>
    </div>
  );
}

