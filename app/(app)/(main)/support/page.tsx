import * as React from "react";
import { buildMetadata } from "@/lib/seo";
import TicketForm from "@/components/Support/TicketForm";
import Link from "next/link";
import { ThumbsUp } from "@/components/ui/svgs/icons/ThumbsUp";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Chat } from "@/components/ui/svgs/icons/Chat";
import { SUPPORT_CATEGORIES } from "@/constants/support";

export const metadata = buildMetadata({
  title: "Contact Support | Premium Templates",
  description:
    "Get help with your orders, account, or any questions. Our support team is here to assist you.",
  path: "/support",
  screenshotName: "support",
});

const supportFeatures = [
  {
    Icon: Clock,
    title: "Fast Response",
    description: "Our team responds within 24 hours",
  },
  {
    Icon: ThumbsUp,
    title: "Expert Help",
    description: "Knowledgeable team ready to assist",
  },
  {
    Icon: Chat,
    title: "Track Progress",
    description: "View your tickets in your dashboard",
  },
];

export default function SupportPage() {
  return (
    <div className="w-full bg-[#0d0f19]">
      {/* Hero Section */}
      <section
        className="relative py-28 md:py-36 overflow-hidden"
        aria-labelledby="support-hero-title"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1
            id="support-hero-title"
            className="text-4xl md:text-6xl font-bold text-white mb-6 font-paras"
          >
            How Can We{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Help You?
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Our dedicated engineering team is here to assist you with any
            questions, orders, or custom modifications. Submit a ticket and
            we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl bg-[#13151f]/80 border border-white/[0.08] hover:border-white/20 hover:bg-[#161824] transition-all duration-300 shadow-md"
              >
                <div
                  aria-hidden="true"
                  className="shrink-0 w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-300"
                >
                  <feature.Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-xl text-white mb-1 font-paras">
                    {feature.title}
                  </div>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left - Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-paras">
                Submit a Support Ticket
              </h2>
              <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">
                Fill out the form and our team will review your request. You can
                track live updates and responses directly from your{" "}
                <Link
                  href="/dashboard/support"
                  className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4"
                >
                  Dashboard
                </Link>
                .
              </p>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white font-paras">
                  Categories We Cover
                </h3>
                {SUPPORT_CATEGORIES.map((cat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#13151f]/90 border border-white/[0.08] hover:border-white/15 transition-colors"
                  >
                    <div
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full bg-purple-400 shrink-0"
                    />
                    <div>
                      <p className="font-medium text-white text-sm">
                        {cat.label}
                      </p>
                      <p className="text-xs text-gray-400">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-[#13151f]/90 border border-white/[0.08]">
                <h3 className="font-semibold text-white mb-2 font-paras">
                  Already submitted tickets?
                </h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                  View conversation history, replies, and status directly in
                  your dashboard.
                </p>
                <Link
                  href="/dashboard/support"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-all"
                >
                  View My Tickets →
                </Link>
              </div>
            </div>

            {/* Right - Form */}
            <div className="rounded-3xl p-6 md:p-8 bg-[#13151f]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl h-fit">
              <h3 className="text-xl font-bold text-white mb-6 font-paras">
                Create New Ticket
              </h3>
              <React.Suspense
                fallback={
                  <div className="text-gray-400 text-sm">Loading form...</div>
                }
              >
                <TicketForm />
              </React.Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
