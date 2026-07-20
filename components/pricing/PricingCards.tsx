"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";
import { Check } from "@/components/ui/svgs/icons/Check";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";

const SpotlightCard = dynamic(() => import("@/components/ui/SpotlightCard"));

const PricingCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".pricing-card", 
      { opacity: 0, y: 50 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.2, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
      {/* Template Card */}
      <div className="pricing-card">
        <SpotlightCard className="flex flex-col h-full bg-gray-900/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Premium Templates</h3>
            <p className="text-gray-400">Perfect for developers wanting a quick start with high-quality code.</p>
          </div>
          <div className="mb-6 flex items-baseline gap-2">
            <span className="text-sm text-gray-500 font-medium">Starts from</span>
            <span className="text-4xl font-bold tracking-tight">$49</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Instant digital download</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Modern React & Tailwind CSS</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Fully responsive and optimized</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Community support</span>
            </li>
          </ul>
          <Link 
            href="/templates"
            className="w-full rounded-xl py-3.5 px-4 text-center font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 block"
          >
            Browse Templates
          </Link>
        </SpotlightCard>
      </div>

      {/* Custom Dev Card */}
      <div className="pricing-card">
        <SpotlightCard className="flex flex-col h-full bg-neutral-900/30 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden md:scale-105">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="mb-6 relative">
            <span className="absolute -top-4 -right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              Limited Slots
            </span>
            <h3 className="text-2xl font-bold mb-2">Custom Development</h3>
            <p className="text-gray-400">Bespoke web applications built to your exact business requirements.</p>
          </div>
          <div className="mb-6 flex items-baseline gap-2">
            <span className="text-sm text-gray-500 font-medium">Starts from</span>
            <span className="text-4xl font-bold tracking-tight">$599</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 relative z-10">
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-pink-400 shrink-0" />
              <span>Tailored Next.js Application</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-pink-400 shrink-0" />
              <span>Custom backend & database integration</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-pink-400 shrink-0" />
              <span>Advanced animations (GSAP/Framer)</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-pink-400 shrink-0" />
              <span>Dedicated 1-on-1 support</span>
            </li>
          </ul>
          <Link 
            href="/custom-development"
            className="w-full rounded-xl py-3.5 px-4 text-center font-bold text-black bg-white hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 relative z-10"
          >
            Request Custom Build <ArrowRight className="w-4 h-4" />
          </Link>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default PricingCards;
