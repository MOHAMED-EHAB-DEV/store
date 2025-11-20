'use client';

import { useLayoutEffect } from 'react';
import SpotlightCard from '../ui/SpotlightCard';
import Link from 'next/link';

const Pricing = () => {
  useLayoutEffect(() => {
    let ctx: gsap.Context | null = null;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
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
      });
    })();

    return () => ctx?.revert();
  }, []);

  const tiers = [
    {
      name: 'Starter',
      price: '0$',
      description: 'Perfect for side projects and hobbyists.',
      features: ['Up to 3 Free Templates', "Community Support", 'Personal Use license'],
      cta: 'Get Started',
      ctaLink: "/register",
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For growing teams and businesses.',
      features: ['Unlimited Templates', "New template drops every month", 'Priority Support', 'Commercial Use license'],
      cta: 'Try Pro',
      ctaLink: "/register",
      highlight: true,
    },
    {
      name: "Lifetime",
      price: "399$",
      description: "For long term users",
      features: ['Unlimited Templates', "New template drops every month", 'Priority Support', 'Commercial Use license'],
      cta: 'Try Lifetime',
      ctaLink: "/register",
      highlight: false,
    },
    // TODO: Add enterprise tier when Contact is implemented
    // {
    //   name: 'Enterprise',
    //   price: 'Custom',
    //   description: 'Advanced features for large organizations.',
    //   features: ['Unlimited Templates', '24/7 Dedicated support','Template Customization Requests', "Access to beta templates", "1-on-1 onboarding", 'Priority Support', 'Commercial Use license'],
    //   cta: 'Contact US',
    //   highlight: false,
    // },
  ];

  return (
    <section className="w-full py-6 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 pricing-header">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, transparent pricing</h2>
          <p className="max-w-[900px] text-neutral-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <SpotlightCard
              key={tier.name}
              className={`flex flex-col h-full pricing-card ${tier.highlight
                ? 'highlighted-card border-neutral-600 bg-neutral-900/30 backdrop-blur-sm md:scale-105'
                : 'bg-neutral-950/40 backdrop-blur-sm'
                }`}
            >
              <div className="flex flex-col gap-4 h-full">
                <div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                    {tier.price !== 'Custom' && <span className="text-sm font-semibold text-neutral-400">/month</span>}
                  </div>
                  <p className="mt-4 text-sm text-neutral-400">{tier.description}</p>
                </div>
                <ul className="flex-1 space-y-3 mt-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-neutral-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  className={`mt-8 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tier.highlight
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                    }`}
                  href={tier.ctaLink}
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