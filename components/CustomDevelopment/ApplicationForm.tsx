"use client";

import { useState, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SocialProofWheel from "./SocialProofWheel";
import StepSituation from "./steps/StepSituation";
import StepFeatures from "./steps/StepFeatures";
import StepBudget from "./steps/StepBudget";
import StepWorkspace from "./steps/StepWorkspace";
import SuccessModal from "./SuccessModal";
import { sonnerToast } from "@/components/ui/sonner";

const TOTAL_STEPS = 4;

const ApplicationForm = () => {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stepsWrapRef = useRef<HTMLDivElement>(null);
  
  // Create refs for each step container
  const stepRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const handleNext = () => {
    if (step === 1 && situation.length < 20) {
      sonnerToast.error("Please tell us a bit more about your situation.");
      return;
    }
    if (step === 2 && features.length === 0) {
      sonnerToast.error("Please select at least one feature.");
      return;
    }
    if (step === 3 && !budget) {
      sonnerToast.error("Please select a budget range.");
      return;
    }

    if (step < TOTAL_STEPS) {
      const currentRef = stepRefs[step - 1].current;
      const nextRef = stepRefs[step].current;
      
      gsap.to(currentRef, { xPercent: -100, opacity: 0, duration: 0.5, ease: "power2.inOut" });
      gsap.fromTo(
        nextRef,
        { xPercent: 100, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.5, ease: "power2.inOut", onStart: () => setStep(step + 1) }
      );
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const currentRef = stepRefs[step - 1].current;
      const prevRef = stepRefs[step - 2].current;
      
      gsap.to(currentRef, { xPercent: 100, opacity: 0, duration: 0.5, ease: "power2.inOut" });
      gsap.fromTo(
        prevRef,
        { xPercent: -100, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.5, ease: "power2.inOut", onStart: () => setStep(step - 1) }
      );
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    // Format the data for the ticket message
    const message = `📋 Project Application

📌 Current Situation:
${situation}

🛠 Features Needed:
${features.join(", ")}

💰 Budget Expectation:
${budget}`;

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Project Application — Custom Build",
          description: "Needs Custom Build",
          category: "custom-build",
          priority: "high",
          message,
          attachments: []
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTicketId(data.data._id);
        setShowSuccess(true);
      } else {
        sonnerToast.error(data.error || "Failed to submit application");
      }
    } catch (error) {
      sonnerToast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress bar animation
  useGSAP(() => {
    gsap.to(".progress-bar-fill", {
      width: `${(step / TOTAL_STEPS) * 100}%`,
      duration: 0.4,
      ease: "power2.out"
    });
  }, [step]);

  // Navbar hide animation on scroll
  useGSAP(() => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      gsap.to(navbar, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.4,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 40%", 
          toggleActions: "play reverse play reverse",
        }
      });
    }
  }, { scope: containerRef });

  return (
    <section className="py-24 px-4 w-full max-w-4xl mx-auto min-h-screen flex flex-col">
      <SocialProofWheel />

      <div ref={containerRef} className="flex-1 flex flex-col w-full relative">
        {/* Progress Bar & Header */}
        <div className="mb-8 relative z-20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-purple-400 font-medium tracking-wider text-sm uppercase">Application</span>
            <span className="text-gray-400 font-medium text-sm">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="progress-bar-fill h-full bg-gradient-to-r from-purple-500 to-pink-500 w-0" />
          </div>
        </div>

        {/* Steps Container */}
        <div ref={stepsWrapRef} className="relative flex-1 grid grid-cols-1 grid-rows-1 overflow-hidden min-h-[500px]">
          {/* STEP 1 */}
          <div
            ref={stepRefs[0]}
            className="col-start-1 row-start-1 w-full h-auto opacity-100"
            style={{ pointerEvents: step === 1 ? "auto" : "none" }}
          >
            <StepSituation situation={situation} setSituation={setSituation} />
          </div>

          {/* STEP 2 */}
          <div
            ref={stepRefs[1]}
            className="col-start-1 row-start-1 w-full h-auto opacity-0"
            style={{ pointerEvents: step === 2 ? "auto" : "none" }}
          >
            <StepFeatures features={features} setFeatures={setFeatures} />
          </div>

          {/* STEP 3 */}
          <div
            ref={stepRefs[2]}
            className="col-start-1 row-start-1 w-full h-auto opacity-0"
            style={{ pointerEvents: step === 3 ? "auto" : "none" }}
          >
            <StepBudget budget={budget} setBudget={setBudget} featureCount={features.length} />
          </div>

          {/* STEP 4 */}
          <div
            ref={stepRefs[3]}
            className="col-start-1 row-start-1 w-full h-auto opacity-0"
            style={{ pointerEvents: step === 4 ? "auto" : "none" }}
          >
            <StepWorkspace onSubmitComplete={handleFinalSubmit} isSubmittingTicket={isSubmitting} />
          </div>
        </div>

        {/* Navigation Buttons */}
        {step < TOTAL_STEPS && (
          <div className="flex items-center justify-between mt-8 relative z-20">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                step === 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
              }`}
            >
              Go Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Next Step →
            </button>
          </div>
        )}
      </div>

      <SuccessModal open={showSuccess} onOpenChange={setShowSuccess} ticketId={ticketId} />
    </section>
  );
};

export default ApplicationForm;
