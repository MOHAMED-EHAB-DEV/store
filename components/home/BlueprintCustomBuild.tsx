"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const BlueprintCustomBuild = () => {
  const bandRef = useRef<HTMLDivElement>(null);

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
    { scope: bandRef, dependencies: [] },
  );

  return (
    <section className="w-full py-16 text-white relative z-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div
          ref={bandRef}
          className="bg-[#15161b]/95 border border-purple-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden backdrop-blur-md shadow-2xl group"
        >
          {/* Grid Background Pattern */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(168, 85, 247, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(168, 85, 247, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-purple-500/40 hidden sm:block" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-purple-500/40 hidden sm:block" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-purple-500/40 hidden sm:block" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-purple-500/40 hidden sm:block" />

          <div className="flex-1 relative z-10 text-center md:text-left">
            <div className="font-mono text-xs sm:text-sm text-purple-400/80 mb-3">
              // spec: custom-build-module.tsx
            </div>
            <h3 className="text-3xl md:text-4xl font-bold font-paras text-white mb-4 tracking-tight">
              Need something custom?
            </h3>
            <p className="text-gray-400 text-lg max-w-2xl">
              Bought a template but need it tailored to your brand, backend, or
              business logic? We do everything about websites, handling both
              frontend and backend work.
              <span className="text-purple-300 font-medium ml-1">
                I build the custom parts too.
              </span>
            </p>
          </div>

          <div className="relative z-10 shrink-0 mt-4 md:mt-0">
            <Link
              href="/support?subject=Custom%20Build%20Request&category=template-customization"
              className="flex items-center gap-3 px-6 py-3 border border-purple-500/50 hover:bg-purple-500/10 text-purple-300 hover:text-purple-200 text-sm md:text-base font-mono font-medium rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/15 group-hover:border-purple-500/80 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              Request a Custom Build
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlueprintCustomBuild;
