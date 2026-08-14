"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeroOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Base floating animations
      gsap.to(".main-orb", {
        y: -25,
        x: 15,
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(".secondary-orb", {
        y: 30,
        x: -20,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(".tertiary-orb", {
        scale: 1.15,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Floating particles
      gsap.utils.toArray<HTMLElement>(".particle").forEach((particle, i) => {
        gsap.to(particle, {
          y: "random(-35, 35)",
          x: "random(-35, 35)",
          duration: "random(4, 7)",
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.4,
        });
      });

      if (prefersReducedMotion) return;

      // Cursor-reactive parallax tracking
      const mainXTo = gsap.quickTo(".main-orb", "x", {
        duration: 0.8,
        ease: "power2.out",
      });
      const mainYTo = gsap.quickTo(".main-orb", "y", {
        duration: 0.8,
        ease: "power2.out",
      });
      const secXTo = gsap.quickTo(".secondary-orb", "x", {
        duration: 1.2,
        ease: "power2.out",
      });
      const secYTo = gsap.quickTo(".secondary-orb", "y", {
        duration: 1.2,
        ease: "power2.out",
      });

      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const normX = (e.clientX / innerWidth - 0.5) * 60;
        const normY = (e.clientY / innerHeight - 0.5) * 60;

        mainXTo(normX);
        mainYTo(normY);
        secXTo(-normX * 0.8);
        secYTo(-normY * 0.8);
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", handleMouseMove);
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Main gradient aurora orb */}
      <div className="main-orb absolute -top-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] bg-gradient-to-br from-purple-500/25 via-pink-500/15 to-cyan-500/10 rounded-full blur-[100px] will-change-transform" />

      {/* Secondary gradient aurora orb */}
      <div className="secondary-orb absolute -bottom-32 -left-32 w-72 h-72 sm:w-88 sm:h-88 md:w-[420px] md:h-[420px] bg-gradient-to-tr from-blue-500/20 via-teal-500/15 to-green-500/10 rounded-full blur-[100px] will-change-transform" />

      {/* Central depth aura */}
      <div className="tertiary-orb absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-purple-600/10 rounded-full blur-[90px] will-change-transform" />

      {/* Luminous micro-particles */}
      <div className="particle absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/70 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
      <div className="particle absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-pink-400/60 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
      <div className="particle absolute top-1/2 left-3/4 w-2 h-2 bg-cyan-400/70 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      <div className="particle absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-emerald-400/50 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
    </div>
  );
}
