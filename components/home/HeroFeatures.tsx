"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { HeroItems } from "@/constants";

export default function HeroFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".hero-feature-card");

      cards.forEach((card, idx) => {
        const id = Number(card.getAttribute("data-id"));

        const initialX = id === 2 ? 0 : id === 3 ? 180 : -180;
        const initialY = id === 2 ? 40 : 0;

        // Set initial state
        gsap.set(card, {
          opacity: 0,
          x: initialX,
          y: initialY,
        });

        gsap.to(card, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.5,
          delay: idx * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            once: true,
          },
        });
      });
    },
    { scope: containerRef },
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.02,
      duration: 0.2,
      overwrite: "auto",
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      overwrite: "auto",
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={containerRef}
      className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center w-full px-2 sm:px-4 md:px-0"
      aria-label="Key features overview"
    >
      {HeroItems.map(({ id, title, desc }) => {
        return (
          <div
            key={id}
            data-id={id}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="hero-feature-card group relative overflow-hidden md:w-1/4 w-full rounded-2xl bg-card/70 backdrop-blur-md border border-border/60 p-8 hover:border-accent/40 hover:bg-card/80 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2 cursor-pointer"
          >
            {/* Enhanced glow effect on hover */}
            <div className="absolute inset-0 bg-linear-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Floating particles effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700">
              <div
                className="absolute top-4 end-4 w-1 h-1 bg-accent rounded-full animate-ping"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute bottom-6 start-6 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-1/3 end-1/3 w-0.5 h-0.5 bg-accent rounded-full animate-twinkle"
                style={{ animationDelay: "1s" }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-paras font-bold text-white group-hover:text-accent transition-colors duration-300 leading-snug">
                  {title}
                </h2>
              </div>
              <p className="text-medium-contrast leading-loose text-base font-medium">
                {desc}
              </p>
            </div>

            {/* Subtle border glow */}
            <div
              className="absolute inset-0 rounded-xl bg-linear-to-br from-accent/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "xor",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />
          </div>
        );
      })}
    </section>
  );
}
