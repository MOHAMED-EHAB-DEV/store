"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const Header = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(".pricing-badge", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    )
    .fromTo(".pricing-title",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(".pricing-desc",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.6"
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="text-center mb-20 max-w-3xl mx-auto space-y-6">
      <span className="pricing-badge inline-block py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold border border-purple-500/20">
        Pricing Plans
      </span>
      <h1 className="pricing-title text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
        Premium Templates & <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Custom Next.js Development
        </span>
      </h1>
      <p className="pricing-desc text-gray-400 text-lg md:text-xl leading-relaxed">
        Choose a premium React and Tailwind CSS template to launch fast, or hire us for bespoke custom web app development. 
        <span className="block mt-2 font-semibold text-purple-300">Limited slots available for custom development.</span>
      </p>
    </div>
  );
};

export default Header;
