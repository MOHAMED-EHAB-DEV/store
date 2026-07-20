"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { FAQS } from "@/constants/faqs";
import { Plus } from "@/components/ui/svgs/icons/Plus";

export default function HomeFAQ() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

    // Pick 5 critical FAQs for the home page
    const criticalFaqIds = [
        "what-is-store",
        "tech-stack-details",
        "usage-rights",
        "custom-dev-pricing",
        "template-customization"
    ];
    
    const displayFaqs = criticalFaqIds
        .map(id => FAQS.find(faq => faq.id === id))
        .filter(Boolean) as typeof FAQS;

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
            }
        });

        tl.fromTo(".home-faq-title",
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(".home-faq-desc",
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
            "-=0.6"
        )
        .fromTo(".home-faq-btn",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" },
            "-=0.6"
        )
        .fromTo(".home-faq-item",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
            "-=0.4"
        );
    }, { scope: containerRef });

    const toggleOpen = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section ref={containerRef} className="w-full relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    
                    {/* Left Column: Sticky Heading */}
                    <div className="lg:col-span-5 relative">
                        <div className="lg:sticky lg:top-32 space-y-8">
                            <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold border border-purple-500/20 home-faq-title">
                                Support & Questions
                            </span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white home-faq-title leading-[1.1]">
                                Got <br className="hidden lg:block"/> Questions?
                            </h2>
                            <p className="text-lg text-gray-400 max-w-md home-faq-desc">
                                Everything you need to know about our premium templates, custom development process, and licensing.
                            </p>
                            <div className="pt-4 home-faq-btn">
                                <Link 
                                    href="/faqs"
                                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                                >
                                    View All FAQs
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Scrolling Accordions */}
                    <div className="lg:col-span-7">
                        <div className="border-t border-gray-800">
                            {displayFaqs.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div 
                                        key={faq.id} 
                                        className="home-faq-item border-b border-gray-800 group"
                                    >
                                        <button 
                                            onClick={() => toggleOpen(index)}
                                            className="w-full flex items-center justify-between py-6 md:py-8 text-left transition-colors focus:outline-none"
                                        >
                                            <h3 className={`text-xl md:text-2xl font-semibold pr-8 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                {faq.question}
                                            </h3>
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-purple-500 bg-purple-500/10 text-purple-400 rotate-45' : 'border-gray-800 text-gray-500 group-hover:border-gray-600'}`}>
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </button>
                                        <div 
                                            className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}
                                        >
                                            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
