'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TextPlugin, ScrollTrigger } from 'gsap/all';
import { Download, Figma } from '@/components/ui/svgs/Icons';
import SplitText from '../ui/SplitText';
import {figmaFeatures} from "@/constants";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const FigmaFeatures = () => {
    useGSAP(() => {
        ScrollTrigger.create({
            trigger: '.figma-section',
            start: 'top bottom',
            end: 'bottom 30%',
            onEnter: () => {
                const figmaTl = gsap.timeline();

                const figmaChars = document.querySelectorAll('.figma-title .char');
                figmaTl.fromTo(
                    figmaChars,
                    { opacity: 0, y: 100, rotationX: -90 },
                    {
                        duration: 0.8,
                        y: 0,
                        opacity: 1,
                        rotationX: 0,
                        stagger: 0.02,
                        ease: 'power3.out',
                    }
                );

                figmaTl.fromTo(
                    '.figma-feature',
                    { opacity: 0, x: -50 },
                    {
                        duration: 1,
                        x: 0,
                        opacity: 1,
                        stagger: 0.1,
                        ease: 'power2.out',
                    },
                    '-=0.3'
                );

                figmaTl.fromTo(
                    '.figma-preview',
                    { opacity: 0, scale: 0.8, rotation: -5 },
                    {
                        duration: 1.2,
                        scale: 1,
                        opacity: 1,
                        rotation: 0,
                        ease: 'power3.out',
                    },
                    '-=0.5'
                );
            },
        });
    });

    return (
        <section className="figma-section relative z-10 px-4 py-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div className="text-center lg:text-left">
                        <h2 className="figma-title text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                            {SplitText('Figma Design Systems')}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                            Comprehensive design systems built by professionals. Each template includes components, color palettes, typography, and interactive prototypes ready for your next project.
                        </p>

                        <div className="space-y-4 sm:space-y-6 mb-8">
                            {figmaFeatures.map((feature) => (
                                <div key={feature.title} className="figma-feature flex space-x-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button className="flex gap-2 items-center justify-center bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold btn">
                                <Download className="w-5 h-5 mr-2" />
                                Browse Figma Templates
                            </button>
                            {/*<button className="flex gap-2 items-center justify-center glass hover:bg-white/15 text-foreground font-medium px-5 sm:px-6 py-3 rounded-lg transition-all duration-300 hover:backdrop-blur-xl">*/}
                            {/*    <Play className="w-5 h-5 mr-2" />*/}
                            {/*    Watch Tutorial*/}
                            {/*</button>*/}
                        </div>
                    </div>

                    <div className="figma-preview relative mt-10 lg:mt-0">
                        <div className="glass-strong p-6 sm:p-8 rounded-3xl">
                            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 sm:p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full" />
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                                    </div>
                                    <Figma className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-white/20 rounded" />
                                    <div className="h-4 bg-white/10 rounded w-3/4" />
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="h-16 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-lg" />
                                        <div className="h-16 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-white font-semibold mb-2">Design System Pro</div>
                                <div className="text-gray-400 text-sm">Complete component library</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FigmaFeatures;
