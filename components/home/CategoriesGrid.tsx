"use client";

import { useRef } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/components/ui/svgs/CategoriesIcons";
import type { ICategory } from "@/lib/validations/category";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function CategoryCard({ category, isHero, index }: { category: ICategory; isHero: boolean; index: number }) {
  const Icon = category.Icon || getCategoryIcon(category.slug);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const iconWrapRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hardware acceleration hints for animated elements
      gsap.set([iconWrapRef.current, spotlightRef.current, arrowRef.current], { 
        willChange: "transform" 
      });

      // Idle float for icon wrapper
      gsap.to(iconWrapRef.current, {
        y: -3,
        duration: 2 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.1,
      });

      // Hover timeline
      const hoverTl = gsap.timeline({ paused: true });
      hoverTl
        .to(iconWrapRef.current, { scale: 1.1, duration: 0.3, ease: "power2.out" })
        .to(cardRef.current, { borderColor: "rgba(168, 85, 247, 0.5)", duration: 0.3, ease: "power2.out" }, 0)
        .to(arrowRef.current, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, 0);

      // Mouse spotlight & magnetic CTA
      const xTo = gsap.quickTo(spotlightRef.current, "x", { duration: 0.2, ease: "power3" });
      const yTo = gsap.quickTo(spotlightRef.current, "y", { duration: 0.2, ease: "power3" });
      const arrowX = gsap.quickTo(arrowRef.current, "x", { duration: 0.2, ease: "power3" });
      const arrowY = gsap.quickTo(arrowRef.current, "y", { duration: 0.2, ease: "power3" });

      const handleMouseEnter = () => hoverTl.play();
      const handleMouseLeave = () => {
        hoverTl.reverse();
        arrowX(0);
        arrowY(0);
      };

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

            // Magnetic arrow logic (active near bottom-right)
            if (lastEvent.clientX > rect.right - 100 && lastEvent.clientY > rect.bottom - 100) {
                arrowX((lastEvent.clientX - (rect.right - 40)) * 0.2);
                arrowY((lastEvent.clientY - (rect.bottom - 40)) * 0.2);
            } else {
                arrowX(0);
                arrowY(0);
            }
            rafId = null;
          });
        }
      };

      cardRef.current?.addEventListener("mouseenter", handleMouseEnter);
      cardRef.current?.addEventListener("mouseleave", handleMouseLeave);
      cardRef.current?.addEventListener("mousemove", handleMouseMove);

      return () => {
        cardRef.current?.removeEventListener("mouseenter", handleMouseEnter);
        cardRef.current?.removeEventListener("mouseleave", handleMouseLeave);
        cardRef.current?.removeEventListener("mousemove", handleMouseMove);
        if (rafId) cancelAnimationFrame(rafId);
      };
    });
  }, { scope: cardRef });

  return (
    <Link
      ref={cardRef}
      href={`/templates/category/${category.slug}`}
      className={`category-card group relative flex flex-col justify-between p-6 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden transition-colors ${
        isHero ? "md:col-span-2" : ""
      }`}
    >
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute w-[600px] h-[600px] -left-[300px] -top-[300px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-10">
        <div className="flex items-start justify-between">
          <div ref={iconWrapRef} className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 shadow-inner border border-white/5">
            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-md" />
            <div className="relative z-10 svg-gradient-accent w-7 h-7">
              <Icon className="w-full h-full" />
            </div>
          </div>
          
          {/* <div className="flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
            <span className="text-xs font-semibold tracking-wide text-white/90">
              {category.templateCount === 0 
                ? "Coming Soon" 
                : `${category.templateCount} Template${category.templateCount === 1 ? "" : "s"}`}
            </span>
          </div> */}
        </div>

        <div className="flex flex-col gap-1.5 pr-8">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div 
        ref={arrowRef}
        className="absolute bottom-6 right-6 z-10 opacity-0 -translate-x-4 text-purple-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </div>
    </Link>
  );
}

export default function CategoriesGrid({ categories }: { categories: ICategory[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ".category-card",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", clearProps: "transform" }
          );
        }
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ".category-card",
            { opacity: 0 },
            { opacity: 1, duration: 0.8 }
          );
        }
      });
    });
  }, { scope: containerRef });

  if (!categories || categories.length === 0) return null;

  // Determine hero card logic based on count (only one hero max, needs 3x difference)
  const minCount = Math.min(...categories.map(c => c.templateCount));
  const maxCount = Math.max(...categories.map(c => c.templateCount));
  const hasHero = categories.length >= 3 && maxCount >= (minCount || 1) * 3 && maxCount > 0;

  // Grid columns based on category count
  let gridCols = "grid-cols-1";
  if (categories.length > 4) {
    gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  } else if (categories.length > 1) {
    gridCols = "grid-cols-1 sm:grid-cols-2";
  }

  return (
    <div ref={containerRef} className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8`}>
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="svg-accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <style>{`
        .svg-gradient-accent svg [stroke="currentColor"] { stroke: url(#svg-accent-gradient); }
        .svg-gradient-accent svg [fill="currentColor"] { fill: url(#svg-accent-gradient); }
      `}</style>

      <div className={`grid gap-6 ${gridCols}`}>
        {categories.map((category, idx) => (
          <CategoryCard 
            key={category._id} 
            category={category} 
            index={idx}
            isHero={hasHero && category.templateCount === maxCount && idx === 0} 
          />
        ))}
      </div>
    </div>
  );
}
