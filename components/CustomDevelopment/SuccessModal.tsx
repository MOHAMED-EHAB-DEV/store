"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CalendarSkeleton from "./CalendarSkeleton";
import "react-day-picker/dist/style.css";
import { sonnerToast } from "@/components/ui/sonner";

// Custom styles for react-day-picker dark mode inserted in global CSS or scoped here

const DayPicker = dynamic(() => import("react-day-picker").then(mod => mod.DayPicker), {
  ssr: false,
  loading: () => <CalendarSkeleton />,
});

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string | null;
}

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

const SuccessModal = ({ open, onOpenChange, ticketId }: SuccessModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, y: 40, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      
      gsap.fromTo(
        checkRef.current,
        { scale: 0, rotation: -45 },
        { scale: 1, rotation: 0, duration: 0.5, delay: 0.2, ease: "back.out(2)" }
      );
    }
  }, [open]);

  const handleSkip = () => {
    if (ticketId) {
      router.push(`/dashboard/support/${ticketId}`);
    } else {
      router.push("/dashboard/support");
    }
    onOpenChange(false);
  };

  const handleBookCall = async () => {
    if (!selectedDate || !selectedTime || !ticketId) return;
    setIsSubmitting(true);

    try {
      const formattedDate = selectedDate.toLocaleDateString();
      const message = `I have booked a strategy call for ${formattedDate} at ${selectedTime}.`;

      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, attachments: [] }),
      });

      if (response.ok) {
        sonnerToast.success("Strategy call booked!");
        handleSkip();
      } else {
        sonnerToast.error("Failed to book call, please try in chat.");
      }
    } catch (e) {
      sonnerToast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="7xl" className="p-0 border-white/10 bg-[#0f1015] rounded-2xl overflow-hidden focus:outline-none">
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] max-h-[85vh] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
          
          {/* Left Side: Confirmation & Info */}
          <div className="p-8 md:p-12 flex flex-col justify-center border-r border-white/10 bg-black/20">
            <div ref={checkRef} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-8 border border-green-500/30">
              <span className="text-green-400 text-4xl">✓</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 font-paras">Application Received</h2>
            <p className="text-gray-400 mb-6 text-lg">
              Your secure client workspace has been created and your project ticket is now open.
            </p>
            
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 mb-8">
              <h4 className="text-purple-300 font-semibold mb-2">Next Step: Strategy Call</h4>
              <p className="text-sm text-gray-300">
                Book a quick 15-minute introductory call to go over your requirements, or skip directly to your chat dashboard to start messaging.
              </p>
            </div>

            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors text-left flex items-center gap-2 mt-auto"
            >
              Skip — Enter Dashboard <span className="text-xl">→</span>
            </button>
          </div>

          {/* Right Side: Calendar Selection */}
          <div className="p-8 md:p-12 flex flex-col bg-[#15161b]">
            <h3 className="text-xl font-bold mb-4">Select Date & Time</h3>
            
            <div className="flex-1 flex flex-col items-center">
              {/* This custom style class overrides react-day-picker defaults for dark mode */}
              <style dangerouslySetInnerHTML={{__html: `
                .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #a855f7; --rdp-background-color: rgba(168, 85, 247, 0.2); margin: 0; }
                .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { color: white; background-color: var(--rdp-accent-color); }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(255,255,255,0.1); }
              `}} />
              
              <div className="p-4 rounded-xl border border-white/5 bg-black/40 shadow-inner mb-4 backdrop-blur-sm">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(""); // reset time when date changes
                  }}
                  disabled={{ before: new Date() }}
                />
              </div>

              {selectedDate && (
                <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 text-center">Available Times</h4>
                  <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2" data-lenis-prevent={true}>
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          selectedTime === time 
                            ? "border-purple-500 bg-purple-500 text-white font-medium" 
                            : "border-white/10 hover:border-purple-500/50 hover:bg-white/5 text-gray-300"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleBookCall}
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className="w-full py-4 mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Booking..." : "Book Strategy Call"}
            </button>
          </div>

        </div>
      </ModalContent>
    </Modal>
  );
};

export default SuccessModal;
