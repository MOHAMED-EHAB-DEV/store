"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.15)",
  spotlightSize = 500,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const card = cardRef.current;
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
        gsap.to(spotlight, { opacity: 1, duration: 0.3, ease: "power2.out" });
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
    { scope: cardRef }
  );

  const halfSize = spotlightSize / 2;

  return (
    <div
      ref={cardRef}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden ${className}`}
    >
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute opacity-0"
        style={{
          width: `${spotlightSize}px`,
          height: `${spotlightSize}px`,
          left: `-${halfSize}px`,
          top: `-${halfSize}px`,
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 65%)`,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
