"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { NextJS } from "@/components/ui/svgs/icons/NextJS";
import { MongoDB } from "@/components/ui/svgs/icons/MongoDB";
import { TailwindCSS } from "@/components/ui/svgs/icons/TailwindCSS";
import { GSAP } from "@/components/ui/svgs/icons/GSAP";
import { Stripe } from "@/components/ui/svgs/icons/Stripe";
import { ReactIcon } from "../ui/svgs/CategoriesIcons";

const STACK = [
  { name: "Next.js", icon: NextJS, color: "text-white" },
  { name: "React", icon: ReactIcon, color: "text-blue-400" },
  { name: "MongoDB", icon: MongoDB, color: "text-green-500" },
  { name: "TailwindCSS", icon: TailwindCSS, color: "text-cyan-400" },
  { name: "GSAP", icon: GSAP, color: "text-green-400" },
  { name: "Stripe", icon: Stripe, color: "text-indigo-400" },
];

const TechStack = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const items = gsap.utils.toArray('.tech-item');
    
    // Continuous random floating
    items.forEach((item: any) => {
      gsap.to(item, {
        y: "random(-15, 15)",
        x: "random(-10, 10)",
        rotation: "random(-5, 5)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 px-4 w-full max-w-7xl mx-auto border-t border-white/10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-paras">Modern Tech Stack</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          We use the latest technologies to ensure your application is fast, secure, and future-proof.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-4xl mx-auto">
        {STACK.map((tech, idx) => (
          <div
            key={idx}
            className="tech-item flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <tech.icon className={`w-12 h-12 ${tech.color} group-hover:scale-110 transition-transform`} />
            <span className="font-medium text-sm text-gray-300">{tech.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TechStack;
