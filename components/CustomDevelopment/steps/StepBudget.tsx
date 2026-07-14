"use client";

import React, { useState } from "react";
import EstimatePreview from "../EstimatePreview";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";

interface StepBudgetProps {
  budget: string;
  setBudget: (budget: string) => void;
  featureCount: number;
}

const BUDGET_TIERS = [
  "$5,000 – $10,000",
  "$10,000 – $25,000",
  "$25,000 – $50,000",
  "$50,000+",
];

const StepBudget = ({ budget, setBudget, featureCount }: StepBudgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full flex flex-col h-full justify-center">
      <h3 className="text-2xl md:text-3xl font-bold mb-4 font-paras">Step 3: Budget Expectation</h3>
      <p className="text-gray-400 mb-8 text-sm md:text-base">
        Select a budget range. We craft premium, high-converting digital products, so our projects start at $5k.
      </p>

      <div className="relative w-full max-w-md mx-auto z-20">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all ${
            isOpen ? "border-purple-500 bg-white/10" : "border-white/20 bg-black/40 hover:bg-white/5"
          }`}
        >
          <span className={`text-lg ${budget ? "text-white font-medium" : "text-gray-500"}`}>
            {budget || "Select your budget tier..."}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full rounded-2xl border border-white/20 bg-[#1a1b23] shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {BUDGET_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => {
                  setBudget(tier);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-4 transition-colors hover:bg-purple-500/20 hover:text-purple-300 ${
                  budget === tier ? "bg-purple-500/10 text-purple-400 font-medium" : "text-gray-300"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-[140px] flex items-center w-full max-w-2xl mx-auto z-10">
        {budget && (
          <EstimatePreview budgetTier={budget} featureCount={featureCount} />
        )}
      </div>
    </div>
  );
};

export default StepBudget;
