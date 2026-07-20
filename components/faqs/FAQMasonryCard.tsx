"use client";

import { FAQ } from "@/constants/faqs";

interface FAQMasonryCardProps {
  faq: FAQ;
  categoryIcon?: string;
  categoryName?: string;
}

export default function FAQMasonryCard({
  faq,
  categoryIcon,
  categoryName,
}: FAQMasonryCardProps) {
  
  // Vary the styling based on the category to create a clear difference between cards
  const categoryVariants: Record<string, any> = {
    "general": {
      bg: "bg-gray-900/40",
      border: "border-purple-500/20",
      hoverBorder: "hover:border-purple-500/60",
      glow: "from-purple-500/10 to-pink-500/10",
      badgeText: "text-purple-400",
      badgeBg: "bg-purple-500/10",
      badgeBorder: "border-purple-500/20"
    },
    "products": {
      bg: "bg-gray-900/60",
      border: "border-blue-500/20",
      hoverBorder: "hover:border-blue-500/60",
      glow: "from-blue-500/10 to-cyan-500/10",
      badgeText: "text-blue-400",
      badgeBg: "bg-blue-500/10",
      badgeBorder: "border-blue-500/20"
    },
    "custom-dev": {
      bg: "bg-neutral-900/50",
      border: "border-pink-500/20",
      hoverBorder: "hover:border-pink-500/60",
      glow: "from-pink-500/10 to-rose-500/10",
      badgeText: "text-pink-400",
      badgeBg: "bg-pink-500/10",
      badgeBorder: "border-pink-500/20"
    },
    "technical": {
      bg: "bg-zinc-900/40",
      border: "border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/60",
      glow: "from-emerald-500/10 to-teal-500/10",
      badgeText: "text-emerald-400",
      badgeBg: "bg-emerald-500/10",
      badgeBorder: "border-emerald-500/20"
    },
    "payment": {
      bg: "bg-slate-900/40",
      border: "border-amber-500/20",
      hoverBorder: "hover:border-amber-500/60",
      glow: "from-amber-500/10 to-orange-500/10",
      badgeText: "text-amber-400",
      badgeBg: "bg-amber-500/10",
      badgeBorder: "border-amber-500/20"
    }
  };

  const variant = categoryVariants[faq.category] || categoryVariants["general"];

  return (
    <div className={`rounded-3xl p-6 md:p-8 ${variant.bg} border ${variant.border} backdrop-blur-md shadow-lg transition-all duration-300 ${variant.hoverBorder} hover:shadow-2xl group relative overflow-hidden h-full flex flex-col`}>
      {/* Subtle gradient glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${variant.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {categoryIcon && (
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/80 border border-gray-700 text-sm shadow-inner">
              {categoryIcon}
            </span>
          )}
          {categoryName && (
            <span className={`text-xs font-semibold uppercase tracking-wider ${variant.badgeText} ${variant.badgeBg} px-3 py-1 rounded-full border ${variant.badgeBorder}`}>
              {categoryName}
            </span>
          )}
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight group-hover:text-gray-200 transition-colors">
          {faq.question}
        </h3>

        <div className="text-gray-400 leading-relaxed text-sm md:text-base mt-auto">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}
