import Hero from "@/components/home/Hero";
import WhyUs from "@/components/home/WhyUS";
import FeaturedTemplates from "@/components/home/FeaturedTemplates";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorks from "@/components/home/HowItWorks";
import dynamic from "next/dynamic";
import GSAPInitializer from "@/components/home/GSAPInitializer";
import CustomBuildBand from "@/components/home/CustomBuildBand";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MHD Store | Premium Web Templates",
  description:
    "Premium, responsive Next.js and Tailwind CSS templates for modern creators and businesses.",
};

const FramerFeatures = dynamic(
  () => import("@/components/home/FramerFeatures"),
  { ssr: true },
);
const CodedFeatures = dynamic(() => import("@/components/home/CodedFeatures"));
const FigmaFeatures = dynamic(() => import("@/components/home/FigmaFeatures"));
const Pricing = dynamic(() => import("@/components/home/Pricing"));
const Cta = dynamic(() => import("@/components/home/CTA"));
const AboutMe = dynamic(() => import("@/components/home/AboutMe"));
const HeroFeatures = dynamic(() => import("@/components/home/HeroFeatures"));

export default async function Home() {
  return (
    <main
      className="flex flex-col items-center justify-center gap-24 overflow-x-hidden w-dvw md:px-0"
      role="main"
      id="main-content"
    >
      {/*<StickyCTA/>*/}
      <GSAPInitializer />
      <div className="w-full flex flex-col items-center justify-center gap-10 pb-16 relative">
        <Hero />
        <HeroFeatures />
        {/* <CustomBuildBand /> */}
        {/* <Image
                    src="/assets/images/Preview.webp"
                    alt="demo"
                    width={1400}
                    height={1400}
                    className="w-[calc(100dvw-30px)] md:w-[calc(100dvw-80px)] h-full object-contain rounded-xl transition-all border border-border/50 hover:border-accent/30"
                    quality={100}
                    // priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAdEAACAgEFAAAAAAAAAAAAAAACAwABIQQFEXHB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAABAgAR/9oADAMBAAIRAxEAPwCAWjSHthvWwhcN8Wojz3WPYiJXVPcjAg7/2Q=="
                /> */}
        {/* Enhanced background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Main gradient orb */}
          <div className="animate-bounce absolute -top-32 -right-32 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-cyan-500/10 rounded-full blur-3xl" />

          {/* Secondary gradient orb */}
          <div className="animate-bounce absolute -bottom-32 -left-32 w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-linear-to-tr from-blue-500/20 via-teal-500/15 to-green-500/10 rounded-full blur-3xl" />

          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60" />
          <div
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-40"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-float opacity-50"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>

      <FeaturedTemplates />
      <CategoriesSection />
      <WhyUs />
      <FramerFeatures />
      <CodedFeatures />
      <FigmaFeatures />
      <HowItWorks />
      <Pricing />
      {/*<Testimonials/>*/}
      {/*<AnimatedTestimonialsDemo testimonials={testimonials} />*/}
      <AboutMe />
      <Cta />
    </main>
  );
}
