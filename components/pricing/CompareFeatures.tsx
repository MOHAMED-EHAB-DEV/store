"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Check } from "@/components/ui/svgs/icons/Check";
import { X } from "@/components/ui/svgs/icons/X";

const features = [
  { name: "Full Source Code", template: true, custom: true },
  { name: "Lifetime Updates", template: true, custom: true },
  { name: "Commercial License", template: true, custom: true },
  { name: "Tailwind CSS Styling", template: true, custom: true },
  { name: "Community Support", template: true, custom: false },
  { name: "Dedicated 1-on-1 Support", template: false, custom: true },
  { name: "Custom Backend Integration", template: false, custom: true },
  { name: "Tailored UI/UX Design", template: false, custom: true },
  { name: "Performance Optimization", template: "Standard", custom: "Advanced" },
];

const CompareFeatures = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      }
    });

    tl.fromTo(".feature-header", 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    )
    .fromTo(".feature-table", 
      { opacity: 0, y: 40 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.3"
    )
    .fromTo(".feature-row", 
      { opacity: 0, x: -20 }, 
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="mb-24">
      <div className="feature-header text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Compare Features</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Not sure which option is right for you? See exactly what's included in our premium templates versus a custom web app build.
        </p>
      </div>
      
      <div className="feature-table overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950/50">
              <th className="p-6 font-semibold text-gray-300 w-1/2">Feature</th>
              <th className="p-6 font-semibold text-center text-gray-300 w-1/4 border-l border-gray-800">Template</th>
              <th className="p-6 font-semibold text-center text-purple-400 w-1/4 border-l border-gray-800">Custom Dev</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {features.map((feature, idx) => (
              <tr key={idx} className="feature-row hover:bg-gray-800/20 transition-colors">
                <td className="p-6 font-medium text-gray-300">{feature.name}</td>
                <td className="p-6 text-center border-l border-gray-800/50">
                  {typeof feature.template === "boolean" ? (
                    feature.template ? (
                      <Check className="w-5 h-5 text-gray-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm text-gray-400">{feature.template}</span>
                  )}
                </td>
                <td className="p-6 text-center border-l border-gray-800/50">
                  {typeof feature.custom === "boolean" ? (
                    feature.custom ? (
                      <Check className="w-5 h-5 text-purple-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-purple-400">{feature.custom}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareFeatures;
