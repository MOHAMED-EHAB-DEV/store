"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const STATS = [
  "12 projects delivered this quarter",
  "Booking for August 2026",
  "4.9★ average client rating",
  "100% on-time delivery rate",
];

const SocialProofWheel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !containerRef.current) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const items = Array.from(wrapRef.current.children);
    const itemHeight = items[0].clientHeight;
    const totalItems = STATS.length; // 4 original items
    let currentIndex = 0;

    let timer: gsap.core.Tween;
    const rotateWheel = () => {
      currentIndex++;
      
      gsap.to(wrapRef.current, {
        y: -(currentIndex * itemHeight),
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          // If we reached the clone (last item), instantly jump back to real first item
          if (currentIndex >= totalItems) {
            currentIndex = 0;
            gsap.set(wrapRef.current, { y: 0 });
          }
          timer = gsap.delayedCall(3.4, rotateWheel);
        }
      });
    };

    // Auto rotate every 4 seconds using GSAP's ticker (pauses when tab is inactive)
    timer = gsap.delayedCall(4, rotateWheel);

    return () => {
      if (timer) timer.kill();
      gsap.killTweensOf(wrapRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-md mx-auto h-12 overflow-hidden bg-white/5 border border-white/10 rounded-full relative mb-12 flex items-center justify-center px-4"
    >
      <div 
        ref={wrapRef} 
        className="w-full absolute top-0 flex flex-col items-center"
      >
        {/* Render original stats */}
        {STATS.map((stat, idx) => (
          <div key={`stat-${idx}`} className="h-12 flex items-center justify-center text-center w-full">
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stat}
            </span>
          </div>
        ))}
        {/* Render one clone of the first item for seamless looping */}
        <div className="h-12 flex items-center justify-center text-center w-full">
          <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {STATS[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofWheel;
