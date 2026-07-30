"use client";

import { useRef } from "react";
import { Star } from "@/components/ui/svgs/icons/Star";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const words = containerRef.current.querySelectorAll(".hero-word");

      gsap.fromTo(
        words,
        {
          opacity: 0,
          y: 40,
          filter: "blur(6px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex items-center justify-center gap-3 min-h-screen pb-4 pt-24 md:pt-36 h-full w-full"
      aria-labelledby="hero-title"
    >
      <div className="flex flex-col gap-6 items-center justify-center w-full relative z-10">
        <Badge
          variant="secondary"
          className="hero-badge relative bg-linear-to-r from-yellow-400 via-orange-500 to-pink-500 text-white border border-yellow-500/50 rounded-full px-6 py-3 font-semibold overflow-hidden hover:shadow-[0_0_30px_rgba(255,215,0,0.8)] transition-all duration-500 group"
        >
          <Star className="w-4 h-4 mr-2 inline-block group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
          <span className="relative z-10">Unleash Your Creativity</span>
          <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shine" aria-hidden="true" />
        </Badge>

        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 id="hero-title" className="font-bold text-3xl md:text-5xl lg:text-7xl xl:text-8xl w-full md:w-3/4 text-center font-paras text-white leading-none tracking-tighter px-2 sm:px-0">
            <span className="hero-word inline-block">Premium</span>{" "}
            <span className="hero-word inline-block">Templates</span>{" "}
            <span className="hero-word inline-block">to</span>{" "}
            <span className="hero-word inline-block relative">
              Elevate
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 bg-linear-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"
              />
            </span>{" "}
            <span className="hero-word inline-block">Your</span>{" "}
            <span className="hero-word inline-block">Projects</span>
          </h1>
          <p className="text-base md:text-lg lg:text-2xl w-full md:w-1/2 lg:w-2/5 font-medium text-center font-paras text-medium-contrast leading-relaxed px-4 sm:px-2 md:px-0">
            <span className="hero-word inline-block">Smart</span>{" "}
            <span className="hero-word inline-block">templates.</span>{" "}
            <span className="hero-word inline-block">Clean</span>{" "}
            <span className="hero-word inline-block">design.</span>{" "}
            <span className="hero-word inline-block">Built</span>{" "}
            <span className="hero-word inline-block">to</span>{" "}
            <span className="hero-word inline-block">help</span>{" "}
            <span className="hero-word inline-block">you</span>{" "}
            <span className="hero-word inline-block">move</span>{" "}
            <span className="hero-word inline-block">fast</span>{" "}
            <span className="hero-word inline-block">and</span>{" "}
            <span className="hero-word inline-block">look</span>{" "}
            <span className="hero-word inline-block">great</span>{" "}
            <span className="hero-word inline-block">doing</span>{" "}
            <span className="hero-word inline-block">it.</span>
            <span className="block mt-2 text-purple-300 text-base md:text-lg">
              <span className="hero-word inline-block">Need</span>{" "}
              <span className="hero-word inline-block">it</span>{" "}
              <span className="hero-word inline-block">further</span>{" "}
              <span className="hero-word inline-block">customized?</span>{" "}
              <span className="hero-word inline-block">I</span>{" "}
              <span className="hero-word inline-block">build</span>{" "}
              <span className="hero-word inline-block">that</span>{" "}
              <span className="hero-word inline-block">too.</span>
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-3 px-4 sm:px-0">
          <Link
            className="hero-btn group relative outline-none cursor-pointer will-change-transform transition-all duration-500 border-none px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg bg-white/5 hover:bg-white/10 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-primary"
            href="/templates"
            aria-label="Explore templates page"
            onClick={() => sendGTMEvent({ event: "hero_cta_click" })}
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Templates
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
            </span>
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </Link>

          <Link
            className="group relative outline-none cursor-pointer will-change-transform transition-all duration-500 border border-white/20 hover:border-white/40 bg-transparent hover:bg-white/5 px-8 py-4 rounded-full text-white font-semibold text-lg backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary"
            href="/custom-development"
            aria-label="Work with me custom development page"
          >
            <span className="relative z-10 flex items-center gap-2">
              Work with me
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
