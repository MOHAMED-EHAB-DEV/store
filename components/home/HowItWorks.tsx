"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STEPS } from "@/constants/steps";
import SplitText from "../ui/SplitText";

gsap.registerPlugin(ScrollTrigger);

// Minimal line icons, 1.75px stroke, one consistent family —
// no external dependency, no emoji.
const ICONS: Record<string, ReactNode> = {
  buy: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </>
  ),
  setup: (
    <>
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <polyline points="7 10 9.5 12 7 14" />
      <line x1="12" x2="16" y1="14" y2="14" />
    </>
  ),
  customize: (
    <>
      <path d="M12 3 13.1 9 19 10.5 13.1 12 12 18 10.9 12 5 10.5 10.9 9 Z" />
      <path d="M5 3 5.5 5 7.5 5.5 5.5 6 5 8 4.5 6 2.5 5.5 4.5 5 Z" />
      <path d="M19 15l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z" />
    </>
  ),
  launch: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
};

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const trackFillRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(SVGSVGElement | null)[]>([]);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const nodes = nodeRefs.current.filter(Boolean) as HTMLDivElement[];
      const glows = glowRefs.current.filter(Boolean) as HTMLDivElement[];
      const icons = iconRefs.current.filter(Boolean) as SVGSVGElement[];

      if (reduceMotion) {
        gsap.set(rows, { autoAlpha: 1, y: 0 });
        gsap.set(trackFillRef.current, { scaleY: 1 });
        nodes.forEach((n, i) =>
          gsap.set(n, {
            backgroundColor: "#0e1017",
            borderColor: STEPS[i].color,
          }),
        );
        icons.forEach((el, i) => gsap.set(el, { color: STEPS[i].color }));
        cards.forEach((c, i) =>
          gsap.set(c, { borderColor: `${STEPS[i].color}40` }),
        );
        gsap.set(glows, { opacity: 0.35 });
        return;
      }

      // Resting state
      gsap.set(headingRef.current, { autoAlpha: 0, y: 20 });
      gsap.set(rows, { autoAlpha: 0, y: 28 });
      gsap.set(trackFillRef.current, { scaleY: 0, transformOrigin: "top" });
      gsap.set(glows, { opacity: 0 });

      // Heading — reveals once, nothing pinned, navbar untouched
      gsap.to(headingRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Track fills as the user scrolls naturally past the whole list
      gsap.to(trackFillRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: trackWrapRef.current,
          start: "top 70%",
          end: "bottom 55%",
          scrub: 0.6,
        },
      });

      // Each step reveals independently as it enters the viewport
      rows.forEach((row, i) => {
        const node = nodes[i];
        const glow = glows[i];
        const card = cards[i];
        const icon = icons[i];
        const color = STEPS[i].color;
        const prevGlow = i > 0 ? glows[i - 1] : null;

        const trigger = {
          trigger: row,
          start: "top 82%",
          toggleActions: "play none none none",
        };

        gsap.to(row, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: trigger,
        });

        gsap.to(node, {
          backgroundColor: "#0e1017",
          borderColor: color,
          duration: 0.5,
          scrollTrigger: trigger,
        });

        gsap.to(icon, {
          color,
          duration: 0.5,
          scrollTrigger: trigger,
        });

        gsap.to(card, {
          borderColor: `${color}40`,
          duration: 0.6,
          scrollTrigger: trigger,
        });

        gsap.to(glow, {
          opacity: 0.45,
          duration: 0.6,
          scrollTrigger: trigger,
        });

        if (prevGlow) {
          gsap.to(prevGlow, {
            opacity: 0.15,
            duration: 0.5,
            scrollTrigger: trigger,
          });
        }
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 overflow-hidden"
      aria-labelledby="howitworks-heading"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div ref={headingRef} className="text-center mb-20 md:mb-28">
          <h2
            id="howitworks-heading"
            className="text-3xl md:text-5xl font-bold font-paras text-white"
          >
            {SplitText("From")}{" "}
            <span className="relative">
              {SplitText("Purchase")}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 bg-linear-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"
              />
            </span>{" "}
            {SplitText("to")}{" "}
            <span className="relative">
              {SplitText("Production")}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 bg-linear-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"
              />
            </span>{" "}
            {SplitText("in 4 simple steps")}
          </h2>
        </div>

        <div ref={trackWrapRef} className="relative max-w-4xl mx-auto px-6 md:px-4">
          {/* track — start rail on mobile, centered on desktop */}
          <div className="absolute start-[43px] md:start-1/2 -translate-x-1/2 top-1 bottom-1 w-[2px] bg-white/10 rounded-full overflow-hidden z-0 pointer-events-none">
            <div
              ref={trackFillRef}
              className="absolute top-0 start-0 w-full h-full bg-gradient-to-b from-emerald-400 via-sky-400 to-amber-400 rounded-full"
            />
          </div>

          <div className="relative z-10 flex flex-col gap-14 md:gap-16">
            {STEPS.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={step.key}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  className="relative flex gap-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-10"
                >
                  {/* node */}
                  <div className="relative shrink-0 z-10 md:col-start-2 md:justify-self-center">
                    <div
                      ref={(el) => {
                        glowRefs.current[i] = el;
                      }}
                      className="absolute -inset-2.5 rounded-full blur-[12px] pointer-events-none"
                      style={{ backgroundColor: step.color, opacity: 0 }}
                      aria-hidden="true"
                    />
                    <div
                      ref={(el) => {
                        nodeRefs.current[i] = el;
                      }}
                      className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 bg-[#0e1017] border-white/10 flex items-center justify-center shadow-lg"
                    >
                      <svg
                        ref={(el) => {
                          iconRefs.current[i] = el;
                        }}
                        viewBox="0 0 24 24"
                        className="w-[18px] h-[18px] text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {ICONS[step.key]}
                      </svg>
                    </div>
                  </div>

                  {/* content */}
                  <div
                    className={
                      isEven
                        ? "flex-1 md:col-start-1 md:text-end"
                        : "flex-1 md:col-start-3 md:text-start"
                    }
                  >
                    <div
                      ref={(el) => {
                        cardRefs.current[i] = el;
                      }}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm px-5 py-4 md:px-6 md:py-5"
                    >
                      <div
                        className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-2"
                        style={{ color: step.color }}
                      >
                        Step {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="font-bold font-paras text-white tracking-tight text-lg md:text-xl mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-[15px] text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                      {step.optional && (
                        <div
                          className="inline-block mt-3 px-3 py-1 rounded-full border text-[11px] font-medium tracking-wide"
                          style={{
                            borderColor: `${step.color}33`,
                            color: step.color,
                          }}
                        >
                          Optional — doesn&apos;t block launch
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;