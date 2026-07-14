"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Code2 } from "@/components/ui/svgs/icons/Code2";
import { Rocket } from "@/components/ui/svgs/icons/Rocket";
import { Users } from "@/components/ui/svgs/icons/Users";
import SpotlightCard from "@/components/ui/SpotlightCard";

const CARDS = [
  {
    icon: Code2,
    title: "Architecture-First",
    description: "We don't just write code; we design scalable systems. Every project starts with a robust architectural blueprint.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Rocket,
    title: "Production-Grade Code",
    description: "Built for performance and reliability. We deliver enterprise-level React and Next.js applications that scale.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Ongoing Partnership",
    description: "Your success is our success. We provide continued support and iterative improvements long after launch.",
    gradient: "from-orange-500 to-red-500",
  }
];

const ValueProposition = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray('.value-card');
    
    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 px-4 w-full max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-paras">Why Partner With Us?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          We bring Silicon Valley engineering standards to your projects, ensuring premium quality and unmatched performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CARDS.map((card, idx) => (
          <SpotlightCard
            key={idx}
            className="value-card border border-white/10 bg-white/5 backdrop-blur-md flex flex-col items-start h-full"
            spotlightColor="rgba(255, 255, 255, 0.15)"
          >
            <div className={`p-4 rounded-xl bg-gradient-to-br ${card.gradient} mb-6 relative z-10`}>
              <card.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">{card.title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm relative z-10">
              {card.description}
            </p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};

export default ValueProposition;
