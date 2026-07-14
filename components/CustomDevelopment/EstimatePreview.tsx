"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface EstimatePreviewProps {
  budgetTier: string;
  featureCount: number;
}

const EstimatePreview = ({ budgetTier, featureCount }: EstimatePreviewProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Entrance animation
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );

    // Subtle float animation
    gsap.to(cardRef.current, {
      y: -4,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.5
    });
  }, [budgetTier]); // Re-animate when budget changes

  // Simple logic to estimate timeline based on budget and features
  let estimatedWeeks = 4;
  if (budgetTier.includes("$10k")) estimatedWeeks = 6;
  if (budgetTier.includes("$25k")) estimatedWeeks = 8;
  if (budgetTier.includes("$50k+")) estimatedWeeks = 12;
  
  estimatedWeeks += Math.floor(featureCount / 3);

  return (
    <div ref={cardRef} className="w-full mt-8 p-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]">
      <div className="flex flex-col">
        <span className="text-purple-300 font-medium text-sm mb-1 uppercase tracking-wider">Instant Estimate</span>
        <h4 className="text-xl font-bold text-white">Estimated Timeline: ~{estimatedWeeks} Weeks</h4>
        <p className="text-gray-400 text-sm mt-1">Based on {featureCount} selected features and your budget.</p>
      </div>
      
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/30">
        <span className="text-xl font-bold">⚡</span>
      </div>
    </div>
  );
};

export default EstimatePreview;
