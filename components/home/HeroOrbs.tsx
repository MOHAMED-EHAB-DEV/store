"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Main orb GSAP animation
      gsap.to(".main-orb", {
        y: -30,
        x: 20,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      // Secondary orb GSAP animation
      gsap.to(".secondary-orb", {
        y: 30,
        x: -20,
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      // Particles GSAP animation
      gsap.utils.toArray(".particle").forEach((particle: any, i) => {
        gsap.to(particle, {
          y: "random(-40, 40)",
          x: "random(-40, 40)",
          duration: "random(3, 6)",
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.5
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Main gradient orb */}
      <div className="main-orb absolute -top-32 -right-32 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-cyan-500/10 rounded-full blur-3xl" />

      {/* Secondary gradient orb */}
      <div className="secondary-orb absolute -bottom-32 -left-32 w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-linear-to-tr from-blue-500/20 via-teal-500/15 to-green-500/10 rounded-full blur-3xl" />

      {/* Floating particles */}
      <div className="particle absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-60" />
      <div className="particle absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full opacity-40" />
      <div className="particle absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-50" />
    </div>
  );
}
