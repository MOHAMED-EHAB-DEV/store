'use client';

import {useLayoutEffect} from "react";
import {Star, ArrowRight} from '@/components/ui/svgs/Icons';
import gsap from "gsap"
import {SplitText} from "gsap/all";
import {Badge} from '@/components/ui/badge';
import Link from "next/link";
import TrustSignals from '@/components/ui/TrustSignals';

gsap.registerPlugin(SplitText);

const Hero = () => {
    useLayoutEffect(() => {
        const splitHeader = SplitText.create('.header', {
            type: 'words',
            mask: 'words',
        });

        gsap.set('.header', {opacity: 1,});

        gsap.from(splitHeader.words, {
            duration: 1.5,
            y: 80,
            autoAlpha: 0,
            opacity: 0,
            stagger: 0.08,
            filter: 'blur(6px)',
            ease: 'power2.out',
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
    }, []);

    return (
        <section
            className="relative flex items-center justify-center gap-3 min-h-screen overflow-x-hidden pb-4 pt-24 md:pt-36 h-full w-full"
            aria-labelledby="hero-title"
            role="banner"
        >
            {/* Enhanced Background Layer */}
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/95 to-primary/90"/>
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-cyan-500/10"/>
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent"/>
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"/>
            {/*<div*/}
            {/*    className="absolute md:top-0 md:-left-44 w-full h-full pointer-events-none before:content-[''] before:absolute before:-left-[350px] before:-top-[500px] md:before:-top-72 md:before:-left-44 before:w-[800px] before:h-[800px] before:rounded-full before:bg-gradient-to-br before:from-white/90 before:to-white/40 before:blur-3xl before:opacity-50 before:rotate-[60deg]"/>*/}

            <div className="flex flex-col gap-6 items-center justify-center w-full relative z-10">
                <Badge
                    variant="secondary"
                    className="hero-badge relative bg-linear-to-r from-yellow-400 via-orange-500 to-pink-500 text-white border border-yellow-500/50 rounded-full px-6 py-3 font-semibold overflow-hidden hover:shadow-[0_0_30px_rgba(255,215,0,0.8)] transition-all duration-500 group"
                    role="status"
                    aria-label="Featured announcement"
                >
                    <Star
                        className="w-4 h-4 mr-2 inline-block group-hover:rotate-12 transition-transform duration-300"/>
                    <span className="relative z-10">Unleash Your Creativity</span>
                    <span
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shine"/>
                </Badge>

                <div className="flex flex-col gap-4 items-center justify-center w-full">
                    <h1
                        className="font-bold header opacity-0 text-3xl md:text-5xl lg:text-7xl xl:text-8xl w-full md:w-3/4 text-center font-paras text-high-contrast leading-none tracking-tighter px-2 sm:px-0"
                    >
                        Premium Templates to{' '}
                        <span className="relative">
                            Elevate
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-1 bg-linear-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"/>
                        </span>{' '}
                        Your Projects
                    </h1>
                    <p
                        className="text-base md:text-lg header opacity-0 lg:text-2xl w-full md:w-1/2 lg:w-2/5 font-medium text-center font-paras text-medium-contrast leading-relaxed px-4 sm:px-2 md:px-0"
                        aria-label="Hero Description"
                    >
                        Smart templates. Clean design. Built to help you move fast and look great doing it.
                        <span className="block mt-3 text-base md:text-lg text-low-contrast font-normal">
                            Join 10,000+ developers who trust our templates
                        </span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-3 px-4 sm:px-0">
                    <Link
                        className="hero-btn animate-bounce group relative outline-none cursor-pointer will-change-transform transition-all duration-500 border-none bg-linear-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/25 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-primary"
                        aria-label="Browse"
                        href="/templates"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Explore Templates
                            <ArrowRight
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"/>
                        </span>
                        <div
                            className="absolute inset-0 bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"/>
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

                {/* Trust Signals */}
                {/* <div className="mt-4 w-full max-w-4xl">
                    <TrustSignals variant="horizontal" className="justify-center"/>
                </div> */}
            </div>
        </section>
    );
};

export default Hero;
