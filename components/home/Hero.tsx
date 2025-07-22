'use client';

import {gsap} from 'gsap';
import {useGSAP} from '@gsap/react';
import {SplitText} from 'gsap/SplitText';
import {Star} from 'lucide-react';
import {Badge} from '@/components/ui/badge';

gsap.registerPlugin(SplitText);

const Hero = () => {
    useGSAP(() => {
        const splitHeader = SplitText.create('.header', {
            type: 'words',
            mask: 'words',
        });

        gsap.from(splitHeader.words, {
            duration: 1.5,
            y: 80,
            autoAlpha: 0,
            opacity: 0,
            stagger: 0.05,
            filter: 'blur(6px)',
            ease: 'power2.out',
        });

        gsap.from(['.hero-badge', '.hero-btn'], {
            duration: 1.2,
            y: 50,
            autoAlpha: 0,
            stagger: 0.3,
            ease: 'power3.out',
        });

        gsap.to('.hero-btn', {
            y: -9,
            repeat: -1,
            yoyo: true,
            duration: 1.8,
            ease: 'power1.inOut',
        });
    });

    return (
        <div className="relative flex items-center justify-center gap-3 min-h-[calc(100dvh-200px)] h-full w-full">
            <div className="flex flex-col gap-6 items-center justify-center w-full">
                <Badge
                    variant="secondary"
                    className={`hero-badge relative bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-400 text-white border border-yellow-500 rounded-lg px-4 py-2 font-semibold overflow-hidden animate-shimmer hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-500`}
                >
                    <Star className="w-4 h-4 mr-2 inline-block"/>
                    Unleash Your Creativity
                    <span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine"/>
                </Badge>

                <div className="flex flex-col gap-1 items-center justify-center w-full">
                    <h1 className="header font-bold tracking-tight text-3xl md:text-7xl xl:text-9xl w-full md:w-2/3 text-center font-paras text-white">
                        Premium Templates to Elevate Your Projects
                    </h1>
                    <p className="header text-base md:text-lg lg:text-xl w-[calc(100%-40px)] md:w-1/4 font-medium text-center font-paras text-secondary"
                       aria-label="description">
                        Smart templates. Clean design. Built to help you move fast and look great doing it.
                    </p>
                </div>

                <button
                    className="hero-btn mt-6 outline-none cursor-pointer will-change-transform transition-transform duration-500 border-none bg-[#262626] px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                >
                    Browse Templates
                </button>
            </div>

            <div
                className="absolute md:-bottom-44 md:-left-44 w-full h-full pointer-events-none before:content-[''] before:absolute before:-bottom-32 before:-left-32 before:w-[800px] before:h-[800px] before:rounded-full before:bg-gradient-to-br before:from-white/90 before:to-white/40 before:blur-3xl before:opacity-50 before:rotate-[60deg]"/>
        </div>
    );
};

export default Hero;
