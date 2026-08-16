"use client";

import { useRef } from "react";
import { Star } from "@/components/ui/svgs/icons/Star";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import MagneticButton from "@/components/ui/MagneticButton";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(".hero-word, .hero-badge, .hero-btn-wrap, .hero-proof", {
          opacity: 1,
          y: 0,
          filter: "none",
        });
        return;
      }

      const words = containerRef.current.querySelectorAll(".hero-word");
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Badge entrance
      tl.fromTo(
        ".hero-badge",
        { opacity: 0, scale: 0.85, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "elastic.out(1, 0.6)" }
      );

      // Title & paragraph kinetic word stagger with 3D perspective
      tl.fromTo(
        words,
        {
          opacity: 0,
          y: 35,
          rotateX: -30,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1.4,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.4"
      );

      // Buttons & proof ribbon entrance
      tl.fromTo(
        ".hero-btn-wrap",
        { opacity: 0, y: 25, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1 },
        "-=0.4"
      );

      // tl.fromTo(
      //   ".hero-proof",
      //   { opacity: 0, y: 15 },
      //   { opacity: 1, y: 0, duration: 0.6 },
      //   "-=0.3"
      // );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex items-center justify-center gap-3 min-h-screen pb-4 pt-24 md:pt-36 h-full w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 [perspective:1200px]"
      aria-labelledby="hero-title"
    >
      <div className="flex flex-col gap-6 items-center justify-center w-full relative z-10">
        {/* Glowing Badge */}
        <Badge
          variant="secondary"
          className="hero-badge relative bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white border border-yellow-500/50 rounded-full px-6 py-2.5 font-semibold overflow-hidden hover:shadow-[0_0_35px_rgba(255,215,0,0.8)] transition-all duration-500 group shadow-lg cursor-default"
        >
          <Star
            className="w-4 h-4 mr-2 inline-block group-hover:rotate-12 transition-transform duration-300"
            aria-hidden="true"
          />
          <span className="relative z-10 tracking-wide text-sm font-bold">
            Unleash Your Creativity
          </span>
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shine"
            aria-hidden="true"
          />
        </Badge>

        {/* Heading & Subtitle */}
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1
            id="hero-title"
            className="font-bold text-3xl md:text-5xl lg:text-7xl xl:text-8xl w-full md:w-3/4 text-center font-paras text-white leading-none tracking-tighter px-2 sm:px-0"
          >
            <span className="hero-word inline-block origin-bottom">Premium</span>{" "}
            <span className="hero-word inline-block origin-bottom">Templates</span>{" "}
            <span className="hero-word inline-block origin-bottom">to</span>{" "}
            <span className="hero-word inline-block origin-bottom relative">
              Elevate
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1.5 bg-gradient-to-r from-purple-500/25 via-pink-500/25 to-cyan-500/25 blur-lg rounded-xl"
              />
            </span>{" "}
            <span className="hero-word inline-block origin-bottom">Your</span>{" "}
            <span className="hero-word inline-block origin-bottom">Projects</span>
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

        {/* Magnetic CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-3 px-4 sm:px-0">
          <MagneticButton strength={20} className="hero-btn-wrap">
            <Link
              className="hero-btn group relative inline-flex items-center justify-center outline-none cursor-pointer will-change-transform transition-all duration-500 border-none px-8 py-4 rounded-full text-white font-semibold text-lg shadow-xl bg-white/5 hover:bg-white/10 hover:shadow-purple-500/25 hover:shadow-2xl focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-primary border border-white/10 hover:border-white/25"
              href="/templates"
              aria-label="Explore templates page"
              onClick={() => sendGTMEvent({ event: "hero_cta_click" })}
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Templates
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300"
                  aria-hidden="true"
                />
              </span>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-cyan-500/30 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"
              />
            </Link>
          </MagneticButton>

          <MagneticButton strength={15} className="hero-btn-wrap">
            <Link
              className="group relative inline-flex items-center justify-center outline-none cursor-pointer will-change-transform transition-all duration-500 border border-white/20 hover:border-white/40 bg-transparent hover:bg-white/5 px-8 py-4 rounded-full text-white font-semibold text-lg backdrop-blur-md focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary hover:shadow-lg"
              href="/custom-development"
              aria-label="Work with me custom development page"
            >
              <span className="relative z-10 flex items-center gap-2">
                Work with me
              </span>
            </Link>
          </MagneticButton>
        </div>

        {/* Live Social Proof / Trust Badge */}
        {/* <div className="hero-proof flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-xs sm:text-sm text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>
            Production-ready for Next.js 16 • React 19 • Tailwind CSS v4
          </span>
        </div> */}
      </div>
    </section>
  );
};

export default Hero;
