"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "@/components/ui/svgs/icons/ExternalLink";
import { Modal, ModalContent } from "@/components/ui/Modal";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  demoUrl: string;
  slug: string;
  price: number;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  title,
  demoUrl,
  slug,
  price,
}: PreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [isLoading, setIsLoading] = useState(true);

  const getFrameWidth = () => {
    switch (device) {
      case "mobile":
        return "w-[375px] max-w-full";
      case "tablet":
        return "w-[768px] max-w-full";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        size="full"
        showCloseButton={false}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="h-[92vh] max-w-[96vw] p-0 overflow-hidden bg-[#0c0e15]/95 border border-white/15 backdrop-blur-3xl rounded-3xl flex flex-col shadow-2xl z-50"
      >
        {/* Top Controls Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#11131c]/90 border-b border-white/10 text-white shrink-0"
        >
          {/* Title & Price */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close preview modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate font-paras">{title}</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {price === 0 ? "Free" : `$${price}`}
              </span>
            </div>
          </div>

          {/* Device Switcher (Desktop / Tablet / Mobile) */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDevice("desktop");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                device === "desktop" ? "bg-white/20 text-white shadow-sm" : "text-gray-400 hover:text-white"
              }`}
              aria-label="Desktop viewport preview"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Desktop</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDevice("tablet");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                device === "tablet" ? "bg-white/20 text-white shadow-sm" : "text-gray-400 hover:text-white"
              }`}
              aria-label="Tablet viewport preview"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Tablet</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDevice("mobile");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                device === "mobile" ? "bg-white/20 text-white shadow-sm" : "text-gray-400 hover:text-white"
              }`}
              aria-label="Mobile viewport preview"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Mobile</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors"
              aria-label="Open in new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Tab</span>
            </a>

            <Link
              href={`/templates/${slug}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-xs hover:brightness-110 transition-all shadow-md"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Main Sandbox Frame Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-[#08090d] overflow-hidden"
        >
          <div
            className={`h-full ${getFrameWidth()} rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
          >
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0f1118]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                <span className="text-xs font-mono text-gray-400">Loading Live Sandbox...</span>
              </div>
            )}

            <iframe
              src={demoUrl}
              title={`${title} Live Sandbox Preview`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
