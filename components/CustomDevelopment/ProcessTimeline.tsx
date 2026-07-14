"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const STEPS = [
  {
    number: "01",
    title: "Discovery",
    description: "We analyze your requirements and define the exact scope.",
  },
  {
    number: "02",
    title: "Architecture",
    description: "Designing the database schemas, API routes, and UI flow.",
  },
  {
    number: "03",
    title: "Build",
    description: "Developing with Next.js, Tailwind, and custom animations.",
  },
  {
    number: "04",
    title: "Launch",
    description: "Rigorous testing, deployment, and handover.",
  }
];

const ProcessTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const steps = gsap.utils.toArray('.timeline-step');
    const line = document.querySelector('.timeline-line-fill');
    const lineMobile = document.querySelector('.timeline-line-fill-mobile');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 60%",
        end: "bottom 80%",
        scrub: 1,
      }
    });

    const totalDuration = (steps.length - 1) * 0.25 + 0.5;

    if (line) {
      tl.to(line, { width: "100%", duration: totalDuration, ease: "none" }, 0);
    }
    if (lineMobile) {
      tl.to(lineMobile, { height: "100%", duration: totalDuration, ease: "none" }, 0);
    }

    steps.forEach((step: any, i) => {
      tl.fromTo(
        step,
        { opacity: 0.3, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
        i * 0.25 // sequence along the timeline
      );
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 px-4 w-full max-w-7xl mx-auto overflow-x-hidden">
      <div className="text-center mb-24">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-paras">Our Process</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          A streamlined, transparent workflow designed to deliver results efficiently.
        </p>
      </div>

      <div className="relative">
        {/* Desktop Horizontal Line */}
        <div className="absolute top-8 left-0 w-full h-[2px] bg-white/10 hidden md:block" />
        <div className="timeline-line-fill absolute top-8 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 hidden md:block" />

        {/* Mobile Vertical Line */}
        <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-[2px] bg-white/10 md:hidden" />
        <div className="timeline-line-fill-mobile absolute top-8 left-1/2 -translate-x-1/2 w-[2px] h-0 bg-gradient-to-b from-purple-500 to-pink-500 md:hidden" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
          {STEPS.map((step, idx) => (
            <div key={idx} className="timeline-step flex flex-col items-center md:items-start relative group">
              <div className="w-16 h-16 rounded-full bg-[#15161b] border-2 border-white/20 flex items-center justify-center text-xl font-bold text-white group-hover:border-purple-500 transition-colors mb-6 z-10">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-2 text-center md:text-left">{step.title}</h3>
              <p className="text-gray-400 text-sm text-center md:text-left leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
