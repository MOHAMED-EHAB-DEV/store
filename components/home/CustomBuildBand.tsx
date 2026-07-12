"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const CustomBuildBand = () => {
  const bandRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
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
  }, { scope: bandRef, dependencies: [] });

  return (
    <section className="w-full py-16 text-white relative z-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div ref={bandRef} className="bg-[#15161b]/80 border border-purple-500/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden backdrop-blur-md shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex-1 relative z-10 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-bold font-paras text-white mb-4">
              Need something custom?
            </h3>
            <p className="text-gray-300 text-lg max-w-2xl">
              Bought a template but need it tailored to your brand, backend, or business logic? 
              <span className="text-purple-300 font-medium"> I build the custom parts too.</span>
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Link
              href="/support?category=template-customization"
              className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1"
            >
              Request a Custom Build
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomBuildBand;
