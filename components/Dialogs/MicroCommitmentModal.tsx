"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
} from "@/components/ui/Modal";
import { Star } from "@/components/ui/svgs/icons/Star";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { sonnerToast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

interface MicroCommitmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
}

const PILLS = [
  "GSAP Animations",
  "Tech Stack",
  "Design Quality",
  "Easy Setup",
  "It's Free",
];

export const MicroCommitmentModal = ({
  open,
  onOpenChange,
  templateId,
}: MicroCommitmentModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPill, setSelectedPill] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useGSAP(
    () => {
      if (!open) return;

      if (step === 1) {
        gsap.fromTo(
          ".pill-item",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.08, ease: "power2.out", duration: 0.5 }
        );
      }

      if (step === 2) {
        gsap.to(step1Ref.current, { xPercent: -100, opacity: 0, duration: 0.4 });
        gsap.fromTo(
          step2Ref.current,
          { xPercent: 100, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.4 }
        );
      }

      if (step === 3) {
        gsap.to(step2Ref.current, { xPercent: -100, opacity: 0, duration: 0.4 });
        gsap.fromTo(
          step3Ref.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }
        );
      }
    },
    { dependencies: [step, open], scope: containerRef }
  );

  const handlePillClick = (pill: string) => {
    setSelectedPill(pill);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reviews`, {
        method: "POST",
        body: JSON.stringify({
          comment,
          rating,
          templateId,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setStep(3);
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      sonnerToast.error("Error while submitting your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSelectedPill("");
      setRating(0);
      setComment("");
    }, 300);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="border border-white/10 outline-none focus:outline-none focus:border-none bg-[#15161b] text-white rounded-2xl max-w-md overflow-hidden p-0">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-6 bg-gradient-to-r from-purple-500 to-pink-500"
                  : s < step
                    ? "w-1.5 bg-purple-400"
                    : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div ref={containerRef} className="relative w-full h-[340px] overflow-hidden">
          {/* STEP 1 */}
          <div
            ref={step1Ref}
            className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center"
            style={{ display: step >= 1 ? "flex" : "none" }}
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Download Started!
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              We&apos;d love to hear your thoughts — what caught your eye?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PILLS.map((pill) => (
                <button
                  key={pill}
                  onClick={() => handlePillClick(pill)}
                  className="pill-item px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/40 hover:text-purple-200 transition-all duration-200 text-sm"
                >
                  {pill}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-4 italic">
              Your opinion helps others make better choices ✨
            </p>
          </div>

          {/* STEP 2 */}
          <div
            ref={step2Ref}
            className="absolute inset-0 p-6 flex flex-col opacity-0"
            style={{
              display: step >= 2 ? "flex" : "none",
              pointerEvents: step === 2 ? "auto" : "none",
            }}
          >
            <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              You&apos;re almost there! ⭐
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              Your review helps fellow developers — it only takes a moment.
            </p>

            <div className="flex justify-center gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-125 duration-150"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-current drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 text-xs mb-3">
              {rating === 0
                ? "Tap a star to rate"
                : rating <= 2
                  ? "We appreciate your honesty 🙏"
                  : rating <= 4
                    ? "Glad you liked it! 💜"
                    : "Amazing! You made our day! 🔥"}
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`I loved the ${selectedPill} — it really stood out because...`}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 flex-1 mb-4 text-sm placeholder:text-gray-500"
            />

            <button
              onClick={handleSubmit}
              disabled={!rating || !comment.trim() || isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-40 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 active:scale-[0.98]"
            >
              {isSubmitting ? "Submitting..." : "Share Your Review 💬"}
            </button>
          </div>

          {/* STEP 3 */}
          <div
            ref={step3Ref}
            className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center opacity-0"
            style={{ display: step === 3 ? "flex" : "none" }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 text-green-400 text-3xl ring-2 ring-green-500/20">
              ✓
            </div>
            <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
              You&apos;re a Star! 🌟
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Your review will help other developers find this template.
              <br />
              <span className="text-purple-400">Enjoy building something awesome!</span>
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-white/20 rounded-full hover:bg-white/10 hover:border-purple-400/30 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
