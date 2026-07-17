import Hero from "@/components/home/Hero";
import WhyME from "@/components/home/WhyME";
import FeaturedTemplates from "@/components/home/FeaturedTemplates";
// import CategoriesSection from "@/components/home/CategoriesSection";
// import HowItWorks from "@/components/home/HowItWorks";
import dynamic from "next/dynamic";
import GSAPInitializer from "@/components/home/GSAPInitializer";
import HeroOrbs from "@/components/home/HeroOrbs";
// import CustomBuildBand from "@/components/home/CustomBuildBand";
// import BlueprintCustomBuild from "@/components/home/BlueprintCustomBuild";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "MHD Store | Premium Web Templates",
  description: "Premium, responsive Next.js and Tailwind CSS templates for modern creators and businesses.",
  path: "/",
  screenshotName: "home-desktop"
});

// const FramerFeatures = dynamic(
//   () => import("@/components/home/FramerFeatures"),
//   { ssr: true },
// );
const CodedFeatures = dynamic(() => import("@/components/home/CodedFeatures"));
// const FigmaFeatures = dynamic(() => import("@/components/home/FigmaFeatures"));
const Pricing = dynamic(() => import("@/components/home/Pricing"));
// const Cta = dynamic(() => import("@/components/home/CTA"));
const AboutMe = dynamic(() => import("@/components/home/AboutMe"));
// const HeroFeatures = dynamic(() => import("@/components/home/HeroFeatures"));
const CategoriesSection = dynamic(() => import("@/components/home/CategoriesSection"));
const BlueprintCustomBuild = dynamic(() => import("@/components/home/BlueprintCustomBuild"));
const HowItWorks = dynamic(() => import("@/components/home/HowItWorks"));

export default async function Home() {
  return (
    <main
      className="flex flex-col items-center justify-center gap-24 overflow-x-hidden w-dvw md:px-0 relative"
      role="main"
      id="main-content"
    >
      {/* Global Hero Background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-primary via-primary/95 to-primary/90 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

      {/*<StickyCTA/>*/}
      <GSAPInitializer />
      <div className="w-full flex flex-col items-center justify-center gap-10 pb-16 relative">
        <Hero />
        {/* <HeroFeatures /> */}
        {/* <CustomBuildBand /> */}
        <HeroOrbs />
      </div>

      <FeaturedTemplates />
      <CategoriesSection />
      <WhyME />
      <HowItWorks />
      {/* <FramerFeatures /> */}
      <CodedFeatures />
      <BlueprintCustomBuild />
      {/* <FigmaFeatures /> */}
      <Pricing />
      {/*<Testimonials/>*/}
      {/*<AnimatedTestimonialsDemo testimonials={testimonials} />*/}
      <AboutMe />
      {/* <Cta /> */}
    </main>
  );
}
