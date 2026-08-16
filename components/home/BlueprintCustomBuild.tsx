"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

interface ProjectOption {
  id: string;
  name: string;
  basePrice: number;
  baseDays: number;
  desc: string;
}

const PROJECT_TYPES: ProjectOption[] = [
  {
    id: "customization",
    name: "Template Customization",
    basePrice: 175,
    baseDays: 4,
    desc: "Rebrand, styling, copy & CMS integration into an existing template",
  },
  {
    id: "fullstack",
    name: "Full-Stack Web App",
    basePrice: 800,
    baseDays: 12,
    desc: "Auth, database, payments, server actions, dashboard & responsive UI",
  },
  {
    id: "custom",
    name: "Custom Architecture",
    basePrice: 1600,
    baseDays: 21,
    desc: "End-to-end custom engineering, microservices, complex workflows & AI",
  },
];

interface Addon {
  id: string;
  name: string;
  price: number;
  days: number;
}

const ADDONS: Addon[] = [
  { id: "stripe", name: "Stripe Checkout & Billing", price: 125, days: 2 },
  { id: "ai", name: "AI Feature Integration", price: 175, days: 3 },
  { id: "auth", name: "OAuth & User Roles", price: 100, days: 2 },
];

const BlueprintCustomBuild = () => {
  const bandRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<string>("fullstack");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["stripe"]);

  const currentType = PROJECT_TYPES.find((t) => t.id === selectedType) || PROJECT_TYPES[1];

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find((a) => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const addonsDays = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find((a) => a.id === addonId);
    return sum + (addon ? addon.days : 0);
  }, 0);

  const totalPrice = currentType.basePrice + addonsTotal;
  const totalDays = currentType.baseDays + addonsDays;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(bandRef.current, {
          scrollTrigger: {
            trigger: bandRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          y: 40,
          duration: 1,
          ease: "power3.out",
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(bandRef.current, { opacity: 1, y: 0 });
      });
    },
    { scope: bandRef }
  );

  return (
    <section
      className="w-full py-16 text-white relative z-20 overflow-hidden"
      aria-labelledby="blueprint-title"
    >
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div
          ref={bandRef}
          className="bg-[#12131a]/95 border border-white/15 rounded-3xl p-6 sm:p-10 flex flex-col gap-8 relative overflow-hidden backdrop-blur-2xl shadow-2xl"
        >
          {/* Blueprint Grid Texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-purple-400 font-semibold mb-2">
                // MODULE: CUSTOM-BUILD-ESTIMATOR
              </div>
              <h2
                id="blueprint-title"
                className="text-2xl sm:text-4xl font-bold font-paras text-white tracking-tight"
              >
                Estimate Your Custom Project
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mt-1 max-w-xl">
                Need tailored features, custom backend, or full-scale web app? Select your scope for an instant timeline and ballpark cost.
              </p>
            </div>

            {/* Live Estimate Result Pill */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md shrink-0">
              <div className="text-end">
                <span className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  Est. Delivery: ~{totalDays} Days
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 font-mono">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Tier Buttons */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {PROJECT_TYPES.map((type) => {
              const active = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                    active
                      ? "bg-purple-600/20 border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.2)]"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sm text-white">{type.name}</span>
                    <span className="text-xs font-mono font-semibold text-purple-400">
                      From ${type.basePrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{type.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Add-ons Toggles */}
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Optional Add-on Features:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {ADDONS.map((addon) => {
                const checked = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      checked
                        ? "bg-white/15 border-white/30 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{checked ? "✓" : "+"}</span>
                    <span>{addon.name}</span>
                    <span className="text-[10px] font-mono text-purple-300">
                      +${addon.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              Includes full source code handover, responsive testing, and post-launch guarantee.
            </p>

            <Link
              href={`/custom-development?scope=${selectedType}&addons=${selectedAddons.join(",")}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-sm hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              <span>Book Build with this Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlueprintCustomBuild;
