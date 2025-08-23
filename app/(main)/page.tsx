import * as motion from "motion/react-client";
import Hero from "@/components/home/Hero";
import {HeroItems} from "@/constants";
import WhyUs from "@/components/home/WhyUS";
import FeaturedTemplates from "@/components/home/FeaturedTemplates";
import AboutMe from "@/components/home/AboutMe";
import FramerFeatures from "@/components/home/FramerFeatures";
import CodedFeatures from "@/components/home/CodedFeatures";
import FigmaFeatures from "@/components/home/FigmaFeatures";
import Testimonials from "@/components/home/Testimonials";
import Cta from "@/components/home/CTA";

const isMobile =
    typeof window !== "undefined"
        ? window.matchMedia("(max-width: 768px)").matches
        : false;

export default async function Home() {
    return (
        <main className="flex flex-col items-center justify-center gap-24 overflow-x-hidden w-[100dvw] px-5 md:px-0"
              role="main">
            <div className="w-full flex flex-col items-center justify-center gap-10 pb-16 relative">
                <Hero/>
                <section
                    className="flex flex-col md:flex-row gap-5 md:gap-10 items-center justify-center w-full "
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
                            // initial={{opacity: 0, y: 20}}
                            initial={initialView}
                            whileInView={{opacity: 1, y: 0, x: 0,}}
                            viewport={{margin: "-100px"}}
                            transition={{duration: 0.5, delay: isMobile ? 0 : idx * 0.1}}
                            whileHover={{
                                scale: 1.02,
                                transition: {duration: 0.2}
                            }}
                            className="group relative overflow-hidden md:w-1/4 w-full rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 hover:border-accent/30 transition-all duration-300"
                        >
                            {/* Glow effect on hover */}
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    {/*<div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-2xl group-hover:bg-accent/20 transition-colors duration-300">*/}
                                    {/*    {valueProp.icon}*/}
                                    {/*</div>*/}
                                    <h3 className="text-lg font-paras font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                                        {title}
                                    </h3>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    {desc}
                                </p>
                            </div>

                            {/* Subtle border glow */}
                            <div
                                className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
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
                {/* Enhanced background effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Main gradient orb */}
                    <div
                        className="gradient-orb-1 absolute -top-32 -right-32 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-cyan-500/10rounded-full blur-3xl"
                    />

                    {/* Secondary gradient orb */}
                    <div
                        className="gradient-orb-2 absolute -bottom-32 -left-32 w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-gradient-to-tr from-blue-500/20 via-teal-500/15 to-green-500/10 rounded-full blur-3xl"
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
            <Testimonials/>
            <AboutMe/>
            <Cta/>
        </main>
    );
}
