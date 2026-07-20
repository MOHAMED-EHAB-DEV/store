"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface StandardCTAProps {
  hideFaqButton?: boolean;
}

const CTA = ({ hideFaqButton = false }: StandardCTAProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
      }
    });

    tl.fromTo(".cta-bg-shape",
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out" }
    )
    .fromTo(".cta-content",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(".cta-button",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
      "-=0.4"
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="rounded-3xl p-8 md:p-12 border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-950/50 text-center relative overflow-hidden backdrop-blur-sm">
      <div className="cta-bg-shape absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="cta-bg-shape absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="cta-content">
        <h2 className="text-3xl font-bold mb-4 relative z-10 text-white">Still have questions?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">
          Our support team is here to help you choose the right template or discuss your custom Next.js development needs.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
        <Link 
          href="/support"
          className="cta-button w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors inline-block"
        >
          Contact Support
        </Link>
        {!hideFaqButton && (
          <Link 
            href="/faqs"
            className="cta-button w-full sm:w-auto px-8 py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors border border-gray-700 inline-block"
          >
            Read FAQs
          </Link>
        )}
      </div>
    </div>
  );
};

export default CTA;
