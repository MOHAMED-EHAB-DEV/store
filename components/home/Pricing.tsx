'use client';

import Link from 'next/link';
import dynamic from "next/dynamic";
import { sendGTMEvent } from "@next/third-parties/google";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import BorderBeam from "@/components/ui/BorderBeam";

const SpotlightCard = dynamic(() => import('../ui/SpotlightCard'));

const Pricing = () => {
  useGSAP(() => {
    // Animate section header
    gsap.from('.pricing-header', {
      scrollTrigger: {
        trigger: '.pricing-header',
        start: 'top 85%',
        end: "bottom 30%"
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
    });

    // Animate pricing cards with stagger
    gsap.utils.toArray<HTMLElement>('.pricing-card').forEach((card, i) => {
      const isHighlighted = card.classList.contains('highlighted-card');
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
        opacity: 0,
        y: 60,
        scale: isHighlighted ? 0.95 : 1,
        duration: 1,
        delay: i * 0.1,
        ease: 'power3.out',
      });
    });
  }, []);

  const tiers = [
    {
      name: 'Starter',
      price: '$0',
      isPerMonth: false,
      description: 'Perfect for side projects, prototypes, and hobbyists.',
      features: [
        'Up to 3 Free Templates',
        'Next.js 16 + React 19',
        'Community Support',
        'Personal Use License',
      ],
      cta: 'Get Started Free',
      ctaLink: "/register",
      highlight: false,
    },
    {
      name: "Lifetime Access",
      price: "$399",
      isPerMonth: false,
      description: "Unlimited access to current and all future templates.",
      features: [
        "Unlimited Lifetime Access",
        "All Premium Code & Design Templates",
        "Commercial & Client Work License",
        "Figma + Framer Source Files",
        "Priority 1-on-1 Discord Support",
        "Lifetime Updates & New Releases",
      ],
      cta: 'Pay Once, Build Forever',
      ctaLink: "/register",
      highlight: true,
    },
    {
      name: "Custom Build",
      price: "Custom",
      isPerMonth: false,
      description: "Tailored to your brand, backend architecture, or business logic.",
      features: [
        "Full End-to-End Development",
        "Custom Backend & Database Integration",
        "Dedicated Engineering & Revisions",
        "Full Source Code Ownership",
      ],
      cta: 'Request Custom Build',
      ctaLink: "/custom-development",
      highlight: false,
    },
  ];

  return (
    <section className="w-full py-16 text-white relative overflow-hidden" aria-labelledby="pricing-title">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16 pricing-header">
          <h2 id="pricing-title" className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-paras text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="max-w-[700px] text-gray-400 text-lg leading-relaxed">
            Choose the tier that fits your goals. Zero subscription lock-in, no hidden fees.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 gap-8 md:grid-cols-3 mx-auto items-stretch">
          {tiers.map((tier) => (
            <SpotlightCard
              key={tier.name}
              className={`relative flex flex-col justify-between h-full pricing-card transition-all duration-500 rounded-3xl p-8 ${
                tier.highlight
                  ? 'highlighted-card border-purple-500/40 bg-[#15161b]/95 backdrop-blur-xl md:scale-105 shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] z-10'
                  : 'border-white/10 bg-[#15161b]/60 backdrop-blur-md hover:border-white/20'
              }`}
            >
              {/* Border Beam on Featured Card */}
              {tier.highlight && (
                <BorderBeam size={250} duration={6} borderWidth={2} colorFrom="#a855f7" colorTo="#06b6d4" />
              )}

              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-bold font-paras text-white">{tier.name}</h3>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">{tier.price}</span>
                    {tier.isPerMonth && <span className="text-sm font-semibold text-gray-400">/month</span>}
                  </div>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">{tier.description}</p>
                </div>

                <div className="h-px bg-white/10 w-full" />

                <ul className="space-y-3.5 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  className={`w-full inline-flex items-center justify-center rounded-full px-6 py-4 text-base font-bold transition-all duration-300 transform hover:scale-[1.02] text-center ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:brightness-110'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                  href={tier.ctaLink}
                  aria-label={`${tier.cta} - ${tier.name} plan (${tier.price})`}
                  onClick={() => sendGTMEvent({ 
                    event: "pricing_plan_select", 
                    plan_name: tier.name 
                  })}
                >
                  {tier.cta}
                </Link>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;