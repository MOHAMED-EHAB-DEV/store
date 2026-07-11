"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STEPS } from "@/constants";
import { StepKey } from "@/types";

// Fixed geometry for the straight track.
const NODE_POS: Record<StepKey, { cx: number; cy: number }> = {
  buy: { cx: 80, cy: 90 },
  download: { cx: 265, cy: 90 },
  setup: { cx: 450, cy: 90 },
  customize: { cx: 635, cy: 90 },
  launch: { cx: 820, cy: 90 },
};

const MAIN_LINE_D = "M80,90 L820,90";

// Fractions of the main line's total length reached once each main-line node
// is "done". Segments are 185 long (total 740).
const CHECK_FRACTION: Record<
  "buy" | "download" | "setup" | "customize" | "launch",
  number
> = {
  buy: 0,
  download: 0.25,
  setup: 0.5,
  customize: 0.75,
  launch: 1,
};

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepBlockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const mainFillRef = useRef<SVGPathElement | null>(null);
  const nodeRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const glowRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const checkRefs = useRef<Record<string, SVGPathElement | null>>({});

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: "(max-width: 767px)",
          isDesktop: "(min-width: 768px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          const mainFill = mainFillRef.current;
          if (!mainFill) return;

          const mainLen = mainFill.getTotalLength();

          gsap.set(mainFill, {
            strokeDasharray: mainLen,
            strokeDashoffset: mainLen,
          });

          // initial paint: "buy" active, everything else upcoming — not part
          // of the scrub timeline, just the resting state before scroll starts
          STEPS.forEach((step) => {
            const node = nodeRefs.current[step.key];
            const glow = glowRefs.current[step.key];
            if (!node || !glow) return;
            if (step.key === "buy") {
              gsap.set(node, {
                attr: { fill: step.color, stroke: step.color },
              });
              gsap.set(glow, { opacity: 0.55 });
            } else {
              gsap.set(node, { attr: { fill: "#1c1d24", stroke: "#4b4c56" } });
              gsap.set(glow, { opacity: 0 });
            }
          });

          const blocks = stepBlockRefs.current.filter(
            Boolean,
          ) as HTMLDivElement[];
          gsap.set(blocks, { autoAlpha: 0, yPercent: 40 });
          gsap.set(blocks[0], { autoAlpha: 1, yPercent: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 0%",
              end: isMobile
                ? `+=${STEPS.length * 80}%`
                : `+=${STEPS.length * 100}%`,
              scrub: 1,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                const nav = document.querySelector(".navbar");
                if (nav) {
                  gsap.to(nav, {
                    opacity: self.isActive ? 0 : 1,
                    pointerEvents: self.isActive ? "none" : "auto",
                    duration: 0.5,
                    ease: "power2.inOut",
                  });
                }
              },
            },
          });

          const ease = "power1.inOut";
          tl.to({}, { duration: isMobile ? 0.05 : 0.5 });

          STEPS.forEach((step, i) => {
            if (i === 0) return;
            const label = `step${i}`;
            const prevKey = STEPS[i - 1].key;

            tl.to(
              blocks[i - 1],
              { autoAlpha: 0, yPercent: -40, duration: 1, ease },
              label,
            ).to(
              blocks[i],
              { autoAlpha: 1, yPercent: 0, duration: 1, ease },
              label,
            );

            const fraction =
              CHECK_FRACTION[
                step.key as
                  | "buy"
                  | "download"
                  | "setup"
                  | "customize"
                  | "launch"
              ];
            tl.to(
              mainFill,
              {
                strokeDashoffset: mainLen * (1 - fraction),
                duration: 1,
                ease,
              },
              label,
            );

            const prevGlow = glowRefs.current[prevKey];
            const prevCheck = checkRefs.current[prevKey];
            const currNode = nodeRefs.current[step.key];
            const currGlow = glowRefs.current[step.key];

            if (prevGlow)
              tl.to(prevGlow, { opacity: 0.18, duration: 1, ease }, label);
            if (prevCheck)
              tl.to(prevCheck, { opacity: 1, duration: 1, ease }, label);
            if (currNode)
              tl.to(
                currNode,
                {
                  attr: { fill: step.color, stroke: step.color },
                  duration: 1,
                  ease,
                },
                label,
              );
            if (currGlow)
              tl.to(currGlow, { opacity: 0.55, duration: 1, ease }, label);

            tl.to({}, { duration: isMobile ? 0.05 : 0.5 });
          });
        },
      );

      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready?.then(refresh);
      window.addEventListener("load", refresh);

      return () => window.removeEventListener("load", refresh);
    },
    { scope: containerRef, dependencies: [] },
  );

  return (
    <div className="w-full block">
      <section
        className="w-full h-[100dvh] relative z-10 bg-background overflow-hidden"
        ref={containerRef}
      >
        {/* Header */}
        <div className="absolute top-16 left-0 w-full text-center z-20 pointer-events-none">
          <h2 className="text-3xl md:text-5xl font-bold font-paras text-white">
            How it works
          </h2>
        </div>

        {/* Track */}
        <div className="absolute top-[26%] md:top-[30%] left-1/2 -translate-x-1/2 w-[88vw] max-w-[920px]">
          <svg viewBox="0 0 900 190" className="w-full h-auto overflow-visible">
            <path
              d={MAIN_LINE_D}
              stroke="#2a2b33"
              strokeWidth="2"
              fill="none"
            />
            <path
              ref={mainFillRef}
              d={MAIN_LINE_D}
              stroke="#ffffff"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />

            {STEPS.map((step) => (
              <circle
                key={`glow-${step.key}`}
                ref={(el) => {
                  glowRefs.current[step.key] = el;
                }}
                cx={NODE_POS[step.key].cx}
                cy={NODE_POS[step.key].cy}
                r={19}
                fill={step.color}
                opacity={0}
                style={{ filter: "blur(8px)" }}
              />
            ))}

            {STEPS.map((step) => (
              <circle
                key={`node-${step.key}`}
                ref={(el) => {
                  nodeRefs.current[step.key] = el;
                }}
                cx={NODE_POS[step.key].cx}
                cy={NODE_POS[step.key].cy}
                r={9}
                fill="#1c1d24"
                stroke="#4b4c56"
                strokeWidth="2"
              />
            ))}

            {STEPS.filter((s) => s.key !== "launch").map((step) => {
              const { cx, cy } = NODE_POS[step.key];
              return (
                <path
                  key={`check-${step.key}`}
                  ref={(el) => {
                    checkRefs.current[step.key] = el;
                  }}
                  d={`M${cx - 5},${cy} L${cx - 1},${cy + 4} L${cx + 6},${cy - 5}`}
                  stroke="#0b0c10"
                  strokeWidth="2"
                  fill="none"
                  opacity={0}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>

          {/* Node labels — positioned as % of the 900-wide viewBox */}
          <div
            className="absolute text-xs md:text-sm font-semibold text-gray-400 -translate-x-1/2"
            style={{ left: "8.9%", top: "90%" }}
          >
            Buy
          </div>
          <div
            className="absolute text-xs md:text-sm font-semibold text-gray-400 -translate-x-1/2"
            style={{ left: "29.4%", top: "90%" }}
          >
            Download
          </div>
          <div
            className="absolute text-xs md:text-sm font-semibold text-gray-400 -translate-x-1/2"
            style={{ left: "50%", top: "90%" }}
          >
            Setup
          </div>
          <div
            className="absolute text-xs md:text-sm font-semibold text-gray-400 -translate-x-1/2 text-center"
            style={{ left: "70.6%", top: "90%" }}
          >
            Customize
            <span className="block text-[10px] font-medium italic text-gray-500 mt-0.5 uppercase tracking-wide">
              optional
            </span>
          </div>
          <div
            className="absolute text-xs md:text-sm font-semibold text-gray-400 -translate-x-1/2"
            style={{ left: "91.1%", top: "90%" }}
          >
            Launch
          </div>
        </div>

        {/* Center content */}
        <div className="absolute top-[54%] md:top-[56%] left-1/2 -translate-x-1/2 w-[86vw] max-w-[680px] text-center">
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              ref={(el) => {
                stepBlockRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 w-full"
            >
              <div
                className="font-bold font-paras text-white/5 leading-none mb-[-0.1em] select-none"
                style={{ fontSize: "clamp(60px, 9vw, 110px)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3
                className="font-bold font-paras text-white tracking-tight mb-3 md:mb-4"
                style={{ fontSize: "clamp(26px, 4vw, 42px)" }}
              >
                {step.title}
              </h3>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
                {step.description}
              </p>
              {step.optional && (
                <div className="inline-block mt-4 px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-gray-300 tracking-wide">
                  Optional — doesn&apos;t block launch
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
