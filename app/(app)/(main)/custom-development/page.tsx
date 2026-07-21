import Hero from "@/components/CustomDevelopment/Hero";
import ValueProposition from "@/components/CustomDevelopment/ValueProposition";
import ProcessTimeline from "@/components/CustomDevelopment/ProcessTimeline";
import TechStack from "@/components/CustomDevelopment/TechStack";
import ApplicationForm from "@/components/CustomDevelopment/ApplicationForm";
import SEOContent from "@/components/CustomDevelopment/SEOContent";
import GSAPInitializer from "@/components/home/GSAPInitializer";

import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Custom Development | MHD Store",
  description: "Get a custom, premium web application built specifically for your brand.",
  path: "/custom-development",
  screenshotName: "custom-development"
});

const CustomDevelopmentPage = () => {
  return (
    <main className="relative min-h-screen text-white font-inter w-full">
      <GSAPInitializer />
      <div className="fixed inset-0 bg-[#0A0A0B] -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>
      <Hero />
      <ValueProposition />
      <ProcessTimeline />
      <TechStack />
      <SEOContent />
      <div id="application-form">
        <ApplicationForm />
      </div>
    </main>
  );
};

export default CustomDevelopmentPage;
