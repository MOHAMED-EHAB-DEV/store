"use client";

import { ComponentType, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export interface StatTheme {
  primary: string;
  accent: string;
  glow: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  iconText: string;
}

export interface StatConfig {
  id: "templates" | "customers" | "downloads" | "rating";
  label: string;
  caption: string;
  badge: string;
  cachedValue: number;
  channel?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: ComponentType<{ className?: string }>;
  theme: StatTheme;
}

interface StatCardProps {
  config: StatConfig;
  displayRef: (el: HTMLSpanElement | null) => void;
  cardRef: (el: HTMLDivElement | null) => void;
  pulseRef?: (el: HTMLDivElement | null) => void;
  index?: number;
}

export default function StatCard({
  config,
  displayRef,
  cardRef,
  pulseRef,
  index = 0,
}: StatCardProps) {
  const Icon = config.icon;
  const decimals = config.decimals ?? 0;
  const theme = config.theme;

  const localCardRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const setMergedCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      localCardRef.current = node;
      cardRef(node);
    },
    [cardRef]
  );

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const card = localCardRef.current;
      const spotlight = spotlightRef.current;
      if (!card || !spotlight) return;

      gsap.set(spotlight, { willChange: "transform, opacity" });

      const xTo = gsap.quickTo(spotlight, "x", {
        duration: 0.25,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(spotlight, "y", {
        duration: 0.25,
        ease: "power2.out",
      });

      let rafId: number | null = null;
      let lastEvent: MouseEvent | null = null;

      const handleMouseMove = (e: MouseEvent) => {
        lastEvent = e;
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            if (!card || !lastEvent) {
              rafId = null;
              return;
            }
            const rect = card.getBoundingClientRect();
            xTo(lastEvent.clientX - rect.left);
            yTo(lastEvent.clientY - rect.top);
            rafId = null;
          });
        }
      };

      const handleMouseEnter = () => {
        gsap.to(spotlight, { opacity: 0.7, duration: 0.3, ease: "power2.out" });
      };

      const handleMouseLeave = () => {
        gsap.to(spotlight, { opacity: 0, duration: 0.4, ease: "power2.out" });
      };

      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
      };
    },
    { scope: localCardRef }
  );

  // SSR Initial formatted string for crawlers & instant paint
  const formattedInitial =
    decimals > 0
      ? config.cachedValue.toFixed(decimals)
      : Math.round(config.cachedValue).toLocaleString("en-US");

  return (
    <div
      ref={setMergedCardRef}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-7 transition-all duration-500 hover:border-white/25 hover:shadow-2xl hover:-translate-y-1.5"
    >
      {/* GSAP Cursor Spotlight Overlay */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute w-[400px] h-[400px] -left-[200px] -top-[200px] opacity-0"
        style={{
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* Top Hairline Gradient Accent */}
      <div
        className={`absolute top-0 left-0 h-[2px] w-0 bg-gradient-to-r ${theme.primary} group-hover:w-full transition-all duration-700 ease-out pointer-events-none`}
        aria-hidden="true"
      />

      {/* Real-time Socket Update Glow Flash Effect */}
      <div
        ref={pulseRef}
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          boxShadow: `inset 0 0 35px ${theme.accent}`,
        }}
        aria-hidden="true"
      />

      {/* Card Header: Monospace Index + Badge + Icon */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-wider text-neutral-400 group-hover:text-white transition-colors duration-300">
            0{index + 1}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
          >
            {config.badge}
          </span>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${theme.iconBg} ${theme.iconText} group-hover:scale-110`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="relative z-10 my-1 flex flex-col">
        <div className="flex items-baseline gap-1 text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums">
          {config.prefix && (
            <span className="text-2xl sm:text-3xl font-medium text-neutral-400">
              {config.prefix}
            </span>
          )}
          <span ref={displayRef}>{formattedInitial}</span>
          {config.suffix && (
            <span className={`text-2xl sm:text-3xl font-semibold ${theme.badgeText}`}>
              {config.suffix}
            </span>
          )}
        </div>

        {/* Metric Label */}
        <h3 className="mt-2 text-base font-semibold text-neutral-100 group-hover:text-white transition-colors">
          {config.label}
        </h3>

        {/* Metric Caption */}
        <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
          {config.caption}
        </p>
      </div>
    </div>
  );
}
