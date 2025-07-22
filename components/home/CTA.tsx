"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Cta = () => {
    useGSAP(() => {
        ScrollTrigger.create({
            trigger: ".cta-section",
            start: "top 80%",
            onEnter: () => {
                gsap.fromTo(
                    ".cta-content",
                    { opacity: 0, scale: 0.9, y: 50 },
                    {
                        duration: 1.2,
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        ease: "power3.out",
                    },
                );
            },
        });
    });

    return (
        <section className="cta-section relative z-10 px-6 py-20">
            <div className="max-w-4xl mx-auto text-center">
                {/* Box Gradient */}
                <div className="cta-content bg-gradient-to-br from-indigo-900 via-purple-900 to-teal-900 p-12 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
                        Supercharge Your{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Ideas & Projects
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Take your workflow to the next level. Explore powerful & premium
                        templates with only one subscription.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {/* Button Gradient */}
                        <button className="
                            bg-gradient-to-r from-cyan-500 to-blue-500
                            hover:from-blue-500 hover:to-cyan-500
                            hover:shadow-[0_0_25px_rgba(0,180,255,0.6)]
                            btn">
                            Get Started Now
                            <Sparkles className="w-5 h-5 ml-2 transition-transform" />
                        </button>
                        <div className="text-gray-400 text-sm">
                            No risk – 30-day money-back guarantee
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Cta;