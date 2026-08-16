"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSocketStore } from "@/store/useSocketStore";
import StatCard, { StatConfig } from "./StatCard";
import { Code2 } from "@/components/ui/svgs/icons/Code2";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Star } from "@/components/ui/svgs/icons/Star";

export interface StatsBaseline {
  templates: number;
  customers: number;
  downloads: number;
  rating: number;
}

interface StatsSectionClientProps {
  stats: StatsBaseline;
}

export default function StatsSectionClient({ stats }: StatsSectionClientProps) {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Single boolean ref tracking whether entrance animation has completed
  const hasRevealedRef = useRef<boolean>(false);

  // Latest target value per stat — updated silently before reveal or animated after reveal
  const latestValuesRef = useRef<Record<string, number>>({
    templates: stats.templates,
    customers: stats.customers,
    downloads: stats.downloads,
    rating: stats.rating,
  });

  // DOM refs to stat number <span> elements to animate textContent directly without React re-renders
  const displayRefs = useRef<Record<string, HTMLSpanElement | null>>({
    templates: null,
    customers: null,
    downloads: null,
    rating: null,
  });

  // DOM refs to pulse overlay divs for socket update flashes
  const pulseRefs = useRef<Record<string, HTMLDivElement | null>>({
    templates: null,
    customers: null,
    downloads: null,
    rating: null,
  });

  // Active GSAP tweens for live post-reveal socket updates
  const liveUpdateTweensRef = useRef<Record<string, gsap.core.Tween | null>>({
    templates: null,
    customers: null,
    downloads: null,
    rating: null,
  });

  // DOM refs to card container <div> elements for staggered entrance reveal
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Config array for stats
  const statsConfig: StatConfig[] = [
    {
      id: "templates",
      label: "Production Templates",
      caption: "Curated Next.js 15+ & Tailwind codebases",
      badge: "Full-Stack Ready",
      cachedValue: stats.templates,
      channel: "stat:templates",
      suffix: "+",
      decimals: 0,
      icon: Code2,
      theme: {
        primary: "from-cyan-400 via-sky-500 to-blue-500",
        accent: "rgba(6, 182, 212, 0.4)",
        glow: "rgba(6, 182, 212, 0.16)",
        borderHover: "border-cyan-500/40",
        badgeBg: "bg-cyan-500/10",
        badgeText: "text-cyan-400",
        badgeBorder: "border-cyan-500/20",
        iconBg: "bg-cyan-500/10 border-cyan-500/20",
        iconText: "text-cyan-400",
      },
    },
    {
      id: "customers",
      label: "Customers",
      caption: "Satisfied developers & creators worldwide",
      badge: "Worldwide",
      cachedValue: stats.customers,
      channel: "stat:customers",
      suffix: "+",
      decimals: 0,
      icon: () => <Users hidePlus />,
      theme: {
        primary: "from-emerald-400 via-teal-500 to-green-500",
        accent: "rgba(16, 185, 129, 0.4)",
        glow: "rgba(16, 185, 129, 0.16)",
        borderHover: "border-emerald-500/40",
        badgeBg: "bg-emerald-500/10",
        badgeText: "text-emerald-400",
        badgeBorder: "border-emerald-500/20",
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
        iconText: "text-emerald-400",
      },
    },
    {
      id: "downloads",
      label: "Downloads",
      caption: "Template packages downloaded instantly",
      badge: "Direct Download",
      cachedValue: stats.downloads,
      channel: "stat:downloads",
      suffix: "+",
      decimals: 0,
      icon: Download,
      theme: {
        primary: "from-purple-400 via-violet-500 to-indigo-500",
        accent: "rgba(168, 85, 247, 0.4)",
        glow: "rgba(168, 85, 247, 0.16)",
        borderHover: "border-purple-500/40",
        badgeBg: "bg-purple-500/10",
        badgeText: "text-purple-400",
        badgeBorder: "border-purple-500/20",
        iconBg: "bg-purple-500/10 border-purple-500/20",
        iconText: "text-purple-400",
      },
    },
    {
      id: "rating",
      label: "Customer Rating",
      caption: "Average feedback across verified reviews",
      badge: "5.0 Rated",
      cachedValue: stats.rating,
      channel: "stat:rating",
      suffix: "/5.0",
      decimals: 1,
      icon: Star,
      theme: {
        primary: "from-amber-400 via-yellow-500 to-orange-500",
        accent: "rgba(245, 158, 11, 0.4)",
        glow: "rgba(245, 158, 11, 0.16)",
        borderHover: "border-amber-500/40",
        badgeBg: "bg-amber-500/10",
        badgeText: "text-amber-400",
        badgeBorder: "border-amber-500/20",
        iconBg: "bg-amber-500/10 border-amber-500/20",
        iconText: "text-amber-400",
      },
    },
  ];

  // Helper to format numeric values for textContent rendering
  const formatValue = (val: number, decimals: number = 0): string => {
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.round(val).toLocaleString("en-US");
  };

  // ScrollTrigger entrance orchestration
  useGSAP(
    () => {
      if (!containerRef.current) return;

      const cardNodes = cardElementsRef.current.filter(Boolean) as HTMLDivElement[];

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        if (headerRef.current) {
          gsap.set(headerRef.current, { opacity: 1, y: 0 });
        }
        statsConfig.forEach((cfg) => {
          const el = displayRefs.current[cfg.id];
          if (el) {
            el.textContent = formatValue(
              latestValuesRef.current[cfg.id],
              cfg.decimals
            );
          }
        });
        gsap.set(cardNodes, { opacity: 1, y: 0 });
        hasRevealedRef.current = true;
        return;
      }

      // Initial state
      if (headerRef.current) {
        gsap.set(headerRef.current, { opacity: 0, y: 24 });
      }
      gsap.set(cardNodes, { opacity: 0, y: 32 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          once: true,
        },
        onComplete: () => {
          hasRevealedRef.current = true;
        },
      });

      // 1. Reveal Header
      if (headerRef.current) {
        tl.to(headerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      // 2. Reveal Cards with smooth staggered slide & fade
      tl.to(
        cardNodes,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.3"
      );

      // 3. Count numbers up from 0 to latest target value
      statsConfig.forEach((cfg) => {
        const el = displayRefs.current[cfg.id];
        if (!el) return;

        const proxy = { val: 0 };
        const targetVal = latestValuesRef.current[cfg.id];
        const decimals = cfg.decimals ?? 0;

        tl.to(
          proxy,
          {
            val: targetVal,
            duration: 1.4,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = formatValue(proxy.val, decimals);
            },
          },
          "<0.05"
        );
      });
    },
    { scope: containerRef }
  );

  // Real-time WebSocket connection handling
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    let cleanupFns: (() => void)[] = [];
    let idleId: number | null = null;

    const setupSubscriptions = () => {
      const handleStatChange = (
        statId: string,
        payload: any,
        decimals: number = 0
      ) => {
        const rawValue =
          typeof payload === "number" ? payload : payload?.value;
        if (typeof rawValue !== "number" || isNaN(rawValue)) return;

        const newValue = rawValue;

        if (!hasRevealedRef.current) {
          latestValuesRef.current[statId] = newValue;
        } else {
          latestValuesRef.current[statId] = newValue;
          const el = displayRefs.current[statId];
          if (!el) return;

          const currentText = el.textContent || "0";
          const currentVal = parseFloat(currentText.replace(/,/g, "")) || 0;

          // Trigger visual flash ripple on socket change
          const pulseEl = pulseRefs.current[statId];
          if (pulseEl) {
            gsap.fromTo(
              pulseEl,
              { opacity: 0.8 },
              { opacity: 0, duration: 1.2, ease: "power2.out" }
            );
          }

          liveUpdateTweensRef.current[statId]?.kill();

          const proxy = { val: currentVal };
          liveUpdateTweensRef.current[statId] = gsap.to(proxy, {
            val: newValue,
            duration: 1.8,
            ease: "power4.out",
            onUpdate: () => {
              el.textContent = formatValue(proxy.val, decimals);
            },
          });
        }
      };

      // Subscribe to per-stat channels
      statsConfig.forEach((cfg) => {
        if (!cfg.channel) return;
        const channelName = cfg.channel;
        const handler = (payload: any) =>
          handleStatChange(cfg.id, payload, cfg.decimals ?? 0);
        socket.on(channelName, handler);
        cleanupFns.push(() => socket.off(channelName, handler));
      });

      // Subscribe to general stats-update broadcast event
      const handleGeneralUpdate = (data: any) => {
        if (!data) return;
        const targetStat = data.stat || data.channel?.replace("stat:", "");
        if (targetStat && targetStat in latestValuesRef.current) {
          const cfg = statsConfig.find((c) => c.id === targetStat);
          handleStatChange(targetStat, data.value, cfg?.decimals ?? 0);
        }
      };

      socket.on("stats-update", handleGeneralUpdate);
      cleanupFns.push(() => socket.off("stats-update", handleGeneralUpdate));
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => setupSubscriptions(), {
        timeout: 2000,
      });
    } else {
      setupSubscriptions();
    }

    return () => {
      if (
        idleId !== null &&
        typeof window !== "undefined" &&
        "cancelIdleCallback" in window
      ) {
        window.cancelIdleCallback(idleId);
      }
      cleanupFns.forEach((fn) => fn());
    };
  }, [socket]);

  return (
    <section
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 z-10"
      aria-label="Platform Statistics"
    >
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px]"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-paras">
          Scale & Velocity in{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Real Time
          </span>
        </h2>

        <p className="text-neutral-400 text-sm sm:text-base md:text-lg mt-3.5 max-w-2xl mx-auto leading-relaxed">
          Battle-tested architecture engineered for maximum performance, clean code, and rapid deployment.
        </p>
      </div>

      {/* Cards Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {statsConfig.map((cfg, idx) => (
          <StatCard
            key={cfg.id}
            config={cfg}
            index={idx}
            displayRef={(el) => {
              displayRefs.current[cfg.id] = el;
            }}
            cardRef={(el) => {
              cardElementsRef.current[idx] = el;
            }}
            pulseRef={(el) => {
              pulseRefs.current[cfg.id] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}
