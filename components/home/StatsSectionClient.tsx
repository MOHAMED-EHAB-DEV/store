"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSocketStore } from "@/store/useSocketStore";
import StatCard, { StatConfig } from "./StatCard";
import { Code } from "@/components/ui/svgs/icons/Code";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Star } from "@/components/ui/svgs/icons/Star";
import { Badge } from "@/components/ui/badge";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Single boolean ref tracking whether Phase 2 entrance animation has completed
  const hasRevealedRef = useRef<boolean>(false);

  // Latest target value per stat — updated silently by socket before reveal, or animated after reveal
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

  // Active GSAP tweens for live post-reveal socket updates (killed before starting a new update)
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
      label: "Templates",
      cachedValue: stats.templates,
      channel: "stat:templates",
      suffix: "+",
      decimals: 0,
      icon: Code,
    },
    {
      id: "customers",
      label: "Customers",
      cachedValue: stats.customers,
      channel: "stat:customers",
      suffix: "+",
      decimals: 0,
      icon: () => <Users hidePlus />,
    },
    {
      id: "downloads",
      label: "Downloads",
      cachedValue: stats.downloads,
      channel: "stat:downloads",
      suffix: "+",
      decimals: 0,
      icon: Download,
    },
    {
      id: "rating",
      label: "Avg Rating",
      cachedValue: stats.rating,
      channel: "stat:rating",
      decimals: 1,
      icon: Star,
    },
  ];

  // Helper to format numeric values for textContent rendering
  const formatValue = (val: number, decimals: number = 0): string => {
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.round(val).toLocaleString("en-US");
  };

  // Phase 2: Single ScrollTrigger instance orchestrating section-level entrance
  useGSAP(
    () => {
      if (!containerRef.current) return;

      const cardNodes = cardElementsRef.current.filter(Boolean) as HTMLDivElement[];

      // Check user reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        // Jump straight to final target values without animating count-up
        statsConfig.forEach((cfg) => {
          const el = displayRefs.current[cfg.id];
          if (el) {
            el.textContent = formatValue(
              latestValuesRef.current[cfg.id],
              cfg.decimals
            );
          }
        });
        hasRevealedRef.current = true;
        return;
      }

      // Hide cards initially for GSAP reveal timeline
      gsap.set(cardNodes, { opacity: 0, y: 30 });

      // Create a single ScrollTrigger timeline for the whole section (runs once)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          once: true,
        },
        onComplete: () => {
          // Flip revealed flag once entrance count-up is finished
          hasRevealedRef.current = true;
        },
      });

      // 1. Reveal cards with staggered fade and slide
      tl.to(cardNodes, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
      });

      // 2. Count numbers up from 0 to freshest target value at trigger time
      statsConfig.forEach((cfg) => {
        const el = displayRefs.current[cfg.id];
        if (!el) return;

        const proxy = { val: 0 };
        // Read latest target value (handles case where socket update arrived BEFORE reveal!)
        const targetVal = latestValuesRef.current[cfg.id];
        const decimals = cfg.decimals ?? 0;

        tl.to(
          proxy,
          {
            val: targetVal,
            duration: 1.3,
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

  // Phase 3: Live updates via shared global socket (deferred via requestIdleCallback so it never competes with LCP)
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

        /*
         * PHASE 3 CONTRACT:
         * 1) BEFORE REVEAL: Socket update arrives before ScrollTrigger entrance has played.
         *    Do NOT animate anything. Silently update latestValuesRef. When Phase 2 entrance
         *    eventually fires, it will count from 0 to this fresh value.
         *
         * 2) AFTER REVEAL: Entrance animation has already completed.
         *    Animate increase smoothly from currently displayed number to new target value.
         *    Never reset to 0.
         */
        if (!hasRevealedRef.current) {
          // Silent update before reveal
          latestValuesRef.current[statId] = newValue;
        } else {
          // Animated increase after reveal
          latestValuesRef.current[statId] = newValue;
          const el = displayRefs.current[statId];
          if (!el) return;

          const currentText = el.textContent || "0";
          const currentVal = parseFloat(currentText.replace(/,/g, "")) || 0;

          // Kill any existing live update tween on this stat to prevent overlapping animations
          liveUpdateTweensRef.current[statId]?.kill();

          const proxy = { val: currentVal };
          liveUpdateTweensRef.current[statId] = gsap.to(proxy, {
            val: newValue,
            duration: 2.0,
            ease: "power4.out",
            onUpdate: () => {
              el.textContent = formatValue(proxy.val, decimals);
            },
          });
        }
      };

      // Subscribe to per-stat channels (stat:templates, stat:customers, stat:downloads, stat:rating)
      statsConfig.forEach((cfg) => {
        if (!cfg.channel) return;
        const channelName = cfg.channel;
        const handler = (payload: any) =>
          handleStatChange(cfg.id, payload, cfg.decimals ?? 0);
        socket.on(channelName, handler);
        cleanupFns.push(() => socket.off(channelName, handler));
      });

      // Subscribe to general "stats-update" broadcast event ({ channel/stat, value })
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

    // Defer socket subscription on requestIdleCallback so it never competes with LCP
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
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 relative z-10"
      aria-label="Platform Statistics"
    >
      {/* Section Header with Title & Description */}
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
        {/* <Badge variant="outline" className="gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Live Metrics
        </Badge> */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Trusted by Developers Worldwide
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mt-2">
          Real-time metrics powering modern digital products and developer workflows.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
          />
        ))}
      </div>
    </section>
  );
}
