import React from "react";
import Hero from "@/components/CustomDevelopment/Hero";
import ValueProposition from "@/components/CustomDevelopment/ValueProposition";
import ProcessTimeline from "@/components/CustomDevelopment/ProcessTimeline";
import TechStack from "@/components/CustomDevelopment/TechStack";
import ApplicationForm from "@/components/CustomDevelopment/ApplicationForm";
import GSAPInitializer from "@/components/home/GSAPInitializer";

export const metadata = {
  title: "Custom Development | MHD Store",
  description: "Get a custom, premium web application built specifically for your brand.",
};

const CustomDevelopmentPage = () => {
  return (
    <main className="relative min-h-screen text-white overflow-x-hidden font-inter">
      <GSAPInitializer />
      <div className="fixed inset-0 bg-[#0A0A0B] -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>
      <Hero />
      <ValueProposition />
      <ProcessTimeline />
      <TechStack />
      <div id="application-form">
        <ApplicationForm />
      </div>
    </main>
  );
};

export default CustomDevelopmentPage;
