"use client";

import { useLayoutEffect } from "react";
import Link from "next/link";
import { Sparkles } from "@/components/ui/svgs/Icons";
import TrustSignals from "@/components/ui/TrustSignals";

const Cta = () => {
    useLayoutEffect(() => {
        let ctx: any = null;

        (async () => {
            const { gsap } = await import('gsap');
            const { ScrollTrigger } = await import('gsap/all');

            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
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
        })();

        return () => {
            ctx?.revert?.();
        };
    }, []);

    return (
        <section className="cta-section relative z-10 px-6 py-6">
            <div className="max-w-4xl mx-auto text-center">
                {/* Box Gradient */}
                <div className="cta-content bg-linear-to-br from-indigo-900 via-purple-900 to-teal-900 p-12 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-paras leading-tight">
                        Ready to Launch Your{" "}
                        <span className="bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            Next Project?
                        </span>
                    </h2>
                    <p className="text-xl md:text-2xl text-medium-contrast mb-10 leading-relaxed font-medium">
                        Stop waiting. Launch your website today with our
                        professionally designed templates.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4">
                        {/* Button Gradient */}
                        <Link href="/templates" className="group relative inline-flex items-center justify-center bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Exploring Now
                                <Sparkles className="w-5 h-5 duration-500 transition-transform group-hover:rotate-12" />
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                        </Link>
                        {/*<div className="mt-8">*/}
                        {/*    <TrustSignals variant="horizontal" className="justify-center" />*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Cta;