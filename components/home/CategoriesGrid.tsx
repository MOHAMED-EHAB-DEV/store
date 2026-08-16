"use client";

import { useRef } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/components/ui/svgs/CategoriesIcons";
import type { ICategory } from "@/lib/validations/category";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { Sparkles } from "@/components/ui/svgs/icons/Sparkles";
import { Grid } from "@/components/ui/svgs/icons/Grid";
import EmptyState from "@/components/shared/EmptyState";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCategoryTheme } from "@/constants/categories";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


function CategoryCard({
  category,
  isHero,
  index,
}: {
  category: ICategory;
  isHero: boolean;
  index: number;
}) {
  const Icon = category.Icon || getCategoryIcon(category.slug);
  const theme = getCategoryTheme(category.slug);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const iconWrapRef = useRef<HTMLDivElement>(null);
  const arrowWrapRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      gsap.set([iconWrapRef.current, spotlightRef.current, arrowWrapRef.current], {
        willChange: "transform, opacity",
      });

      // Ambient idle float for icon wrapper
      gsap.to(iconWrapRef.current, {
        y: -3,
        duration: 2.2 + (index % 3) * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.08,
      });

      // Mouse spotlight coordinate smoothing
      const xTo = gsap.quickTo(spotlightRef.current, "x", {
        duration: 0.25,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(spotlightRef.current, "y", {
        duration: 0.25,
        ease: "power2.out",
      });

      let rafId: number | null = null;
      let lastEvent: MouseEvent | null = null;

      const handleMouseMove = (e: MouseEvent) => {
        lastEvent = e;
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            if (!cardRef.current || !lastEvent) {
              rafId = null;
              return;
            }
            const rect = cardRef.current.getBoundingClientRect();
            const x = lastEvent.clientX - rect.left;
            const y = lastEvent.clientY - rect.top;
            xTo(x);
            yTo(y);
            rafId = null;
          });
        }
      };

      cardRef.current?.addEventListener("mousemove", handleMouseMove);

      return () => {
        cardRef.current?.removeEventListener("mousemove", handleMouseMove);
        if (rafId) cancelAnimationFrame(rafId);
      };
    },
    { scope: cardRef }
  );

  return (
    <Link
      ref={cardRef}
      href={`/templates/category/${category.slug}`}
      className={`category-card group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-[#0e1017]/90 border border-white/10 ${theme.borderHover} backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
        isHero ? "md:col-span-2 lg:col-span-2" : ""
      }`}
      aria-label={`Explore ${category.name} templates`}
    >
      {/* Top 1px hairline reflection */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden="true"
      />

      {/* Mouse spotlight radial glow */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute w-[500px] h-[500px] -left-[250px] -top-[250px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Card Header: Icon + Badge */}
      <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
        {/* Icon Wrapper */}
        <div
          ref={iconWrapRef}
          className={`relative flex items-center justify-center w-14 h-14 rounded-2xl ${theme.iconBg} shadow-inner transition-all duration-300 group-hover:scale-105`}
        >
          <div
            aria-hidden="true"
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-25 transition-opacity duration-500 blur-md`}
          />
          <div
            className={`relative z-10 w-7 h-7 ${theme.iconText} transition-transform duration-300 group-hover:scale-110`}
            aria-hidden="true"
          >
            <Icon className="w-full h-full" />
          </div>
        </div>

        {/* Dynamic Status / Count Badge */}
        <div className="flex items-center gap-2">
          {isHero && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-semibold text-amber-400 tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Popular</span>
            </div>
          )}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm`}
          >
            {category.templateCount > 0 ? (
              <>
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span>
                  {category.templateCount}{" "}
                  {category.templateCount === 1 ? "Template" : "Templates"}
                </span>
              </>
            ) : (
              <span>New</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Body: Title + Description + Feature Chips */}
      <div className="relative z-10 flex flex-col flex-grow justify-between gap-5">
        <div>
          <h3
            className={`text-xl sm:text-2xl font-bold font-paras text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
          >
            {category.name}
          </h3>

          {category.description && (
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mt-2 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>

        {/* Feature Tags / Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {theme.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-neutral-300 transition-colors duration-200 group-hover:border-white/10 group-hover:text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Explore Link + Directional Arrow */}
      <div className="relative z-10 flex items-center justify-between pt-5 mt-5 border-t border-white/[0.06]">
        <span className="text-xs sm:text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors duration-200">
          Explore Collection
        </span>

        <div
          ref={arrowWrapRef}
          aria-hidden="true"
          className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 ${theme.badgeText} transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1 group-hover:bg-white/[0.08]`}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom Glowing Accent Line on Hover */}
      <div
        className={`pointer-events-none absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r ${theme.accentBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        aria-hidden="true"
      />
    </Link>
  );
}

export default function CategoriesGrid({
  categories,
}: {
  categories: ICategory[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!categories || categories.length === 0) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(".category-card", { opacity: 1, y: 0 });
        return;
      }

      // Entrance reveal triggered by scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ".category-card",
            { opacity: 0, y: 30, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              stagger: 0.07,
              ease: "power3.out",
              clearProps: "transform",
            }
          );
        },
      });
    },
    { scope: containerRef, dependencies: [categories] }
  );

  // Determine hero card logic (highest templates count)
  const maxCount =
    categories && categories.length > 0
      ? Math.max(...categories.map((c) => c.templateCount || 0))
      : 0;

  const hasHero = categories && categories.length >= 3 && maxCount > 0;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8"
    >
      {/* Category Results / Empty State */}
      {!categories || categories.length === 0 ? (
        <EmptyState
          variant="card"
          icon={Grid}
          title="No categories found"
          description="We don't have any categories available right now. Please check back soon or contact support."
          secondaryAction={{
            label: "Contact Support",
            href: "/support",
            variant: "outline",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, idx) => (
            <CategoryCard
              key={category._id || category.slug}
              category={category}
              index={idx}
              isHero={hasHero && category.templateCount === maxCount && idx === 0}
            />
          ))}
        </div>
      )}

      {/* Bottom Summary Bar */}
      {categories && categories.length > 0 && (
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm text-neutral-400">
              All templates include lifetime updates, full source code, and commercial licensing.
            </span>
          </div>

          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-200 group"
          >
            <span>View All Directory Templates</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}

