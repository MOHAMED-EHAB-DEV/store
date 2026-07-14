import React from "react";

interface StepSituationProps {
  situation: string;
  setSituation: (val: string) => void;
}

const StepSituation = ({ situation, setSituation }: StepSituationProps) => {
  return (
    <div className="w-full flex flex-col h-full justify-center">
      <h3 className="text-2xl md:text-3xl font-bold mb-4 font-paras">Step 1: Your Current Situation</h3>
      <p className="text-gray-400 mb-8 text-sm md:text-base">
        Tell us about your project, your business goals, and what you're looking to achieve with this custom build.
      </p>

      <div className="relative flex-1 min-h-[200px]">
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="e.g., We are a growing SaaS company needing a new marketing site that converts better and loads faster..."
          className="w-full h-full min-h-[200px] p-6 rounded-2xl bg-black/40 border border-white/10 text-white resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-base md:text-lg leading-relaxed placeholder:text-gray-600"
        />
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-medium">
          {situation.length} characters
        </div>
      </div>
    </div>
  );
};

export default StepSituation;
