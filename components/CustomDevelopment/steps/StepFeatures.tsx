"use client";

import React, { useState, useEffect } from "react";
import { SelectableCard } from "@/components/ui/selectable-card";
import { Input } from "@/components/ui/input";

interface StepFeaturesProps {
  features: string[];
  setFeatures: (features: string[]) => void;
}

const AVAILABLE_FEATURES = [
  "Auth (OAuth/JWT)",
  "Database (MongoDB/PostgreSQL)",
  "Payments (Stripe/PayPal)",
  "Custom Animations (GSAP)",
  "Headless CMS",
  "3rd-Party API Integration",
  "Admin Dashboard",
  "Email/Notification System",
  "File Upload/Storage",
  "Real-time Chat",
  "Analytics Integration",
  "SEO Optimization",
];

const StepFeatures = ({ features, setFeatures }: StepFeaturesProps) => {
  const [isOtherActive, setIsOtherActive] = useState(false);
  const [otherText, setOtherText] = useState("");

  // Re-hydrate local state if user navigates back to this step
  useEffect(() => {
    const otherFeature = features.find(f => f.startsWith("Other"));
    if (otherFeature) {
      setIsOtherActive(true);
      if (otherFeature.includes(": ")) {
        setOtherText(otherFeature.split(": ")[1]);
      }
    }
  }, []); // Run once on mount

  const toggleFeature = (feature: string) => {
    if (features.includes(feature)) {
      setFeatures(features.filter((f) => f !== feature));
    } else {
      setFeatures([...features, feature]);
    }
  };

  const handleOtherToggle = () => {
    if (isOtherActive) {
      setIsOtherActive(false);
      setOtherText("");
      setFeatures(features.filter(f => !f.startsWith("Other")));
    } else {
      setIsOtherActive(true);
      setFeatures([...features, "Other"]);
    }
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOtherText(val);
    
    const newFeatures = features.filter(f => !f.startsWith("Other"));
    newFeatures.push(val ? `Other: ${val}` : "Other");
    setFeatures(newFeatures);
  };

  return (
    <div className="w-full flex flex-col h-full justify-center">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold mb-2 font-paras">Step 2: Features Needed</h3>
          <p className="text-gray-400 text-sm md:text-base">
            Select the core functionalities required for your project.
          </p>
        </div>
        <div className="text-sm font-medium px-3 py-1 bg-white/10 rounded-full text-purple-300">
          {features.length} selected
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pb-4">
        {AVAILABLE_FEATURES.map((feature) => {
          const isSelected = features.includes(feature);
          return (
            <SelectableCard
              key={feature}
              label={feature}
              checked={isSelected}
              onClick={() => toggleFeature(feature)}
            />
          );
        })}

        <div className="flex flex-col gap-2 col-span-1 sm:col-span-2 md:col-span-3">
          <SelectableCard
            label="Other"
            description="Have a specific feature in mind?"
            checked={isOtherActive}
            onClick={handleOtherToggle}
          />
          
          {isOtherActive && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
              <Input
                type="text"
                placeholder="Describe your custom feature..."
                value={otherText}
                onChange={handleOtherTextChange}
                classNames={{
                  inputWrapper: "rounded-xl border border-white/20 bg-black/40 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 transition-all",
                  input: "placeholder:text-gray-600"
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepFeatures;
