import React from "react";
import { Textarea } from "@/components/ui/textarea";

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
        <Textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="e.g., We are a growing SaaS company needing a new marketing site that converts better and loads faster..."
          classNames={{
            base: "h-full",
            inputWrapper: "h-full min-h-[200px] p-0 rounded-2xl border-white/10 bg-black/40 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50",
            input: "p-6 text-base md:text-lg leading-relaxed placeholder:text-gray-600 resize-none h-full"
          }}
          rows={10}
        />
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-medium">
          {situation.length} characters
        </div>
      </div>
    </div>
  );
};

export default StepSituation;
