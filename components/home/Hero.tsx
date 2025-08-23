'use client';

import {gsap} from 'gsap';
import {useLayoutEffect} from "react";
import {Star, ArrowRight, Sparkles} from '@/components/ui/svgs/Icons';
import {Badge} from '@/components/ui/badge';
import Link from "next/link";
import {SplitText, ScrollTrigger} from 'gsap/all';

gsap.registerPlugin(SplitText, ScrollTrigger);

const Hero = () => {
    useLayoutEffect(() => {
        const splitHeader = SplitText.create('.header', {
            type: 'words',
            mask: 'words',
        });

        gsap.set('.header', { opacity: 1, });

        gsap.from(splitHeader.words, {
            duration: 1.5,
            y: 80,
            autoAlpha: 0,
            opacity: 0,
            stagger: 0.08,
            filter: 'blur(6px)',
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.header',
                start: 'top 80%', // when top of header hits 80% viewport
                toggleActions: 'play none none none', // only play once
            },
        });

        gsap.to('.hero-btn', {
            y: -9,
            repeat: -1,
            yoyo: true,
            duration: 1.8,
            ease: 'power1.inOut',
        });

        // Animate gradient orbs
        gsap.to('.gradient-orb-1', {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: 'none',
        });

        gsap.to('.gradient-orb-2', {
            rotation: -360,
            duration: 25,
            repeat: -1,
            ease: 'none',
        });
    });

    return (
        <section
            className="relative flex items-center justify-center gap-3 min-h-screen overflow-x-hidden pt-36 sm:pt-46 md:pt-36 h-full w-full"
            aria-labelledby="hero-title"
            role="banner"
        >
            <div className="flex flex-col gap-6 items-center justify-center w-full relative z-10">
                <Badge
                    variant="secondary"
                    className="hero-badge relative bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white border border-yellow-500/50 rounded-full px-6 py-3 font-semibold overflow-hidden hover:shadow-[0_0_30px_rgba(255,215,0,0.8)] transition-all duration-500 group"
                    role="status"
                    aria-label="Featured announcement"
                >
                    <Star
                        className="w-4 h-4 mr-2 inline-block group-hover:rotate-12 transition-transform duration-300"/>
                    <span className="relative z-10">Unleash Your Creativity</span>
                    <span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"/>
                </Badge>

                <div className="flex flex-col gap-4 items-center justify-center w-full">
                    <h1
                        // id="hero-title"
                        className="font-bold header opacity-0 text-3xl md:text-7xl xl:text-8xl 2xl:text-9xl w-full md:w-2/3 text-center font-paras text-white"
                    >
                                    Premium Templates to{' '}
                                    <span className="relative">
                                        Elevate
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"/>
                                    </span>{' '}
                                    Your Projects
                    </h1>
                    <p
                        className="text-base header opacity-0 md:text-lg lg:text-xl w-full md:w-1/3 font-medium text-center font-paras text-secondary leading-relaxed"
                        aria-describedby="hero-title"
                    >
                        Smart templates. Clean design. Built to help you move fast and look great doing it.
                        <span className="block mt-2 text-sm text-secondary">
                                    Join 10,000+ developers who trust our templates
                                </span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6">
                    <Link
                        className="hero-btn group relative outline-none cursor-pointer will-change-transform transition-all duration-500 border-none bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/25 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-primary"
                        aria-label="Browse"
                        href="/templates"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Browse Templates
                            <ArrowRight
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"/>
                        </span>
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"/>
                    </Link>

                    {/*<Link*/}
                    {/*    className="group relative outline-none cursor-pointer will-change-transform transition-all duration-500 border border-white/20 hover:border-white/40 bg-transparent hover:bg-white/5 px-8 py-4 rounded-full text-white font-semibold text-lg backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary"*/}
                    {/*    aria-label="Demo"*/}
                    {/*    href="/templates"*/}
                    {/*    target="_blank"*/}
                    {/*>*/}
                    {/*    <span className="relative z-10 flex items-center gap-2">*/}
                    {/*        View Demo*/}
                    {/*        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"/>*/}
                    {/*    </span>*/}
                    {/*</Link>*/}
                </div>

                <div className="flex items-center gap-6 mt-8 text-sm text-secondary/80">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-primary flex items-center justify-center text-white text-xs font-bold"
                                >
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-secondary">10K+ Happy Customers</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current"/>
                        <span className="text-secondary">4.9/5 Rating</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
