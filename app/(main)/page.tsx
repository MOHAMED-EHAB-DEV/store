import * as motion from "motion/react-client";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
// import Image from "next/image";
import Hero from "@/components/home/Hero";
import {HeroItems, testimonials} from "@/constants";
import WhyUs from "@/components/home/WhyUS";
import FeaturedTemplates from "@/components/home/FeaturedTemplates";
import AboutMe from "@/components/home/AboutMe";
import dynamic from "next/dynamic";
// import FramerFeatures from "@/components/home/FramerFeatures";
// import CodedFeatures from "@/components/home/CodedFeatures";
// import FigmaFeatures from "@/components/home/FigmaFeatures";
// import Testimonials from "@/components/home/Testimonials";
// import StickyCTA from "@/components/ui/StickyCTA";
import Cta from "@/components/home/CTA";
// import AnimatedTestimonialsDemo from "@/components/spectrumui/animated_testimonials";

const FramerFeatures = dynamic(() => import('@/components/home/FramerFeatures'));
const CodedFeatures = dynamic(() => import('@/components/home/CodedFeatures'));
const FigmaFeatures = dynamic(() => import('@/components/home/FigmaFeatures'));

gsap.registerPlugin(useGSAP);

const isMobile =
    typeof window !== "undefined"
        ? window.matchMedia("(max-width: 768px)").matches
        : false;

export default async function Home() {
    return (
        <main className="flex flex-col items-center justify-center gap-24 overflow-x-hidden w-dvw  md:px-0"
              role="main">
            {/*<StickyCTA/>*/}
            <div className="w-full flex flex-col items-center justify-center gap-10 pb-16 relative">
                <Hero/>
                <section
                    className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center w-full px-2 sm:px-4 md:px-0"
                    aria-label="Key features overview"
                >
                    {HeroItems.map(({id, title, desc}, idx) => {
                        const initialView = {
                            opacity: 0,
                            y: HeroItems[1].id === id ? 40 : 0,
                            x: HeroItems[1].id === id ? 0 : HeroItems[2].id === id ? 180 : -180,
                        };
                        return <motion.div
                            key={id}
                            initial={initialView}
                            whileInView={{opacity: 1, y: 0, x: 0,}}
                            viewport={{margin: "-100px"}}
                            transition={{duration: 0.5, delay: isMobile ? 0 : idx * 0.1}}
                            whileHover={{
                                scale: 1.02,
                                transition: {duration: 0.2}
                            }}
                            className="group relative overflow-hidden md:w-1/4 w-full rounded-2xl bg-card/70 backdrop-blur-md border border-border/60 p-8 hover:border-accent/40 hover:bg-card/80 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2"
                        >
                            {/* Enhanced glow effect on hover */}
                            <div
                                className="absolute inset-0 bg-linear-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>

                            {/* Floating particles effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700">
                                <div className="absolute top-4 right-4 w-1 h-1 bg-accent rounded-full animate-ping" style={{animationDelay: '0s'}} />
                                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
                                <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-accent rounded-full animate-twinkle" style={{animationDelay: '1s'}} />
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    {/*<div className="shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-2xl group-hover:bg-accent/20 transition-colors duration-300">*/}
                                    {/*    {valueProp.icon}*/}
                                    {/*</div>*/}
                                    <h2 className="text-xl font-paras font-bold text-high-contrast group-hover:text-accent transition-colors duration-300 leading-snug">
                                        {title}
                                    </h2>
                                </div>
                                <p className="text-medium-contrast leading-loose text-base font-medium">
                                    {desc}
                                </p>
                            </div>

                            {/* Subtle border glow */}
                            <div
                                className="absolute inset-0 rounded-xl bg-linear-to-br from-accent/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{
                                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    maskComposite: "xor",
                                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "xor",
                                    padding: "1px"
                                }}
                            />
                        </motion.div>
                    })}
                </section>
                {/* <Image
                    src="/assets/images/Preview.webp"
                    alt="demo"
                    width={1400}
                    height={1400}
                    className="w-[calc(100dvw-30px)] md:w-[calc(100dvw-80px)] h-full object-contain rounded-xl transition-all border border-border/50 hover:border-accent/30"
                    quality={100}
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAdEAACAgEFAAAAAAAAAAAAAAACAwABIQQFEXHB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAABAgAR/9oADAMBAAIRAxEAPwCAWjSHthvWwhcN8Wojz3WPYiJXVPcjAg7/2Q=="
                /> */}
                {/* Enhanced background effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Main gradient orb */}
                    <div
                        className="gradient-orb-1 absolute -top-32 -right-32 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-cyan-500/10rounded-full blur-3xl"
                    />

                    {/* Secondary gradient orb */}
                    <div
                        className="gradient-orb-2 absolute -bottom-32 -left-32 w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-linear-to-tr from-blue-500/20 via-teal-500/15 to-green-500/10 rounded-full blur-3xl"
                    />

                    {/* Floating particles */}
                    <div
                        className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60"/>
                    <div
                        className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-40"
                        style={{animationDelay: '1s'}}
                    />
                    <div
                        className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-float opacity-50"
                        style={{animationDelay: '2s'}}
                    />
                </div>
            </div>

            <FeaturedTemplates/>
            <WhyUs/>
            <FramerFeatures/>
            <CodedFeatures/>
            <FigmaFeatures/>
            {/*<Testimonials/>*/}
            {/*<AnimatedTestimonialsDemo testimonials={testimonials} />*/}
            <AboutMe/>
            <Cta/>
        </main>
    );
}
