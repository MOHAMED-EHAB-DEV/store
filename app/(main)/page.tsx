import Hero from "@/components/home/Hero";
import {HeroItems} from "@/constants";
import WhyUs from "@/components/home/WhyUS";
import dynamic from "next/dynamic";
import FeaturedTemplates from "@/components/home/FeaturedTemplates";
// import AboutMe from "@/components/home/AboutMe";
// import FramerFeatures from "@/components/home/FramerFeatures";
// import CodedFeatures from "@/components/home/CodedFeatures";
// import FigmaFeatures from "@/components/home/FigmaFeatures";
// import Testimonials from "@/components/home/Testimonials";
// import Cta from "@/components/home/CTA";

const FramerFeatures = dynamic(() => import("@/components/home/FramerFeatures"));
const CodedFeatures = dynamic(() => import("@/components/home/CodedFeatures"));
const FigmaFeatures = dynamic(() => import("@/components/home/FigmaFeatures"));
const Testimonials = dynamic(() => import("@/components/home/Testimonials"));
const AboutMe = dynamic(() => import("@/components/home/AboutMe"));
const Cta = dynamic(() => import("@/components/home/CTA"));

export default async function Home() {
    return (
        <main className="flex flex-col items-center justify-center gap-24" role="main">
            <div className="w-full flex flex-col items-center justify-center relative">
                <Hero/>
                <section 
                    className="flex flex-col md:flex-row gap-5 md:gap-10 items-center justify-center w-full mt-12"
                    aria-label="Key features overview"
                >
                    {HeroItems.map(({ id, title, desc }) => (
                        <article 
                            key={id} 
                            className="flex w-full md:w-1/4 h-full flex-col gap-1 items-center justify-center text-center"
                        >
                            <h2 className="font-paras text-white font-medium text-2xl md:text-3xl tracking-tight">
                                {title}
                            </h2>
                            <p className="font-medium text-base text-center font-paras text-secondary shadow-none">
                                {desc}
                            </p>
                        </article>
                    ))}
                </section>
                {/* Enhanced background effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Main gradient orb */}
                    <div className="gradient-orb-1 absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-cyan-500/10 rounded-full blur-3xl" />

                    {/* Secondary gradient orb */}
                    <div className="gradient-orb-2 absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-500/20 via-teal-500/15 to-green-500/10 rounded-full blur-3xl" />

                    {/* Floating particles */}
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60" />
                    <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}} />
                    <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}} />
                </div>
            </div>

            <FeaturedTemplates />
            <WhyUs />
            <FramerFeatures />
            <CodedFeatures />
            <FigmaFeatures />
            <Testimonials />
            <AboutMe />
            <Cta />
        </main>
    );
}
