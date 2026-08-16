import React from "react";
import { Smartphone } from "@/components/ui/svgs/icons/Smartphone";
import { Shield } from "@/components/ui/svgs/icons/Shield";
import { Zap } from "@/components/ui/svgs/icons/Zap";
import { Code2 } from "@/components/ui/svgs/icons/Code2";
import { Cpu } from "@/components/ui/svgs/icons/Cpu";
import { Blocks } from "@/components/ui/svgs/icons/Blocks";
import { Framer } from "@/components/ui/svgs/icons/Framer";
import { Layers } from "@/components/ui/svgs/icons/Layers";
import { Palette } from "@/components/ui/svgs/icons/Palette";
import { Figma } from "@/components/ui/svgs/icons/Figma";
import { Sparkles } from "@/components/ui/svgs/icons/Sparkles";
import { TailwindCSS } from "@/components/ui/svgs/icons/TailwindCSS";
import { Code } from "@/components/ui/svgs/icons/Code";

interface TemplateFeaturesGridProps {
  type: "coded" | "framer" | "figma";
  tags?: string[];
}

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  colorClass: string;
}

export default function TemplateFeaturesGrid({
  type,
  tags = [],
}: TemplateFeaturesGridProps) {
  const normalizedTags = tags.map((t) => t.toLowerCase());

  // Base features present across all templates
  const baseFeatures: FeatureItem[] = [
    {
      icon: Smartphone,
      title: "100% Mobile & Responsive",
      description:
        "Engineered and rigorously tested for flawless layouts on mobile, tablet, and ultra-wide screens.",
      colorClass: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      icon: Shield,
      title: "Commercial & Client License",
      description:
        "Deploy on unlimited personal or commercial client projects without recurring royalties or attribution.",
      colorClass: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      icon: Zap,
      title: "Instant Download Access",
      description:
        "Get immediate access to the full source code archive, assets, and step-by-step setup guide.",
      colorClass: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  // Type-specific capabilities
  const typeFeatures: FeatureItem[] = [];

  if (type === "coded") {
    typeFeatures.push(
      {
        icon: Code2,
        title: "Modern Next.js & React Stack",
        description:
          "Built on Next.js App Router, Server Components, and clean TypeScript with modular architecture.",
        badge: "Next.js 16",
        colorClass: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      },
      {
        icon: Cpu,
        title: "Blazing Fast Performance",
        description:
          "Pre-rendered SSR, optimized asset loading, and zero layout shifts for top Google Lighthouse scores.",
        badge: "95+ Score",
        colorClass: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30",
      },
      {
        icon: Blocks,
        title: "Modular Component Architecture",
        description:
          "Reusable, cleanly decoupled UI components and tokens that make customizing effortlessly fast.",
        colorClass: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
      }
    );
  } else if (type === "framer") {
    typeFeatures.push(
      {
        icon: Framer,
        title: "Framer-Native Workflow",
        description:
          "Visual drag-and-drop editing with no coding required. Publish live in seconds directly from Framer.",
        badge: "Framer Ready",
        colorClass: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
      },
      {
        icon: Layers,
        title: "Built-in Framer CMS",
        description:
          "Pre-wired dynamic collections for blog posts, projects, team members, and testimonials.",
        colorClass: "from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30",
      },
      {
        icon: Palette,
        title: "Interactive Micro-Animations",
        description:
          "Fluid scroll transitions, interactive hover states, and smooth physics-driven effects.",
        colorClass: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30",
      }
    );
  } else if (type === "figma") {
    typeFeatures.push(
      {
        icon: Figma,
        title: "Complete Figma Design System",
        description:
          "Organized auto-layout layers, semantic color variables, and comprehensive typography scale.",
        badge: "Figma File",
        colorClass: "from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/30",
      },
      {
        icon: Palette,
        title: "Design Tokens & Variables",
        description:
          "Switch brand palettes and typography globally with Figma native color and spacing tokens.",
        colorClass: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      },
      {
        icon: Layers,
        title: "Interactive Component Library",
        description:
          "Buttons, cards, modals, navigation bars, and inputs built with auto-layout and variant states.",
        colorClass: "from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30",
      }
    );
  }

  // Tag-based features if present
  const tagFeatures: FeatureItem[] = [];

  if (normalizedTags.some((t) => t.includes("gsap") || t.includes("animation"))) {
    tagFeatures.push({
      icon: Sparkles,
      title: "GSAP & Kinetic Animations",
      description:
        "Smooth hardware-accelerated scroll triggers, text splits, and interactive magnetic cursor effects.",
      colorClass: "from-green-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/30",
    });
  }

  if (normalizedTags.some((t) => t.includes("tailwind"))) {
    tagFeatures.push({
      icon: TailwindCSS,
      title: "Tailwind CSS Design System",
      description:
        "Tailwind utility classes and CSS custom variables for instant global theme re-styling.",
      colorClass: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    });
  }

  if (normalizedTags.some((t) => t.includes("typescript"))) {
    tagFeatures.push({
      icon: Code,
      title: "Strict TypeScript Safety",
      description:
        "Type-checked props, API response validation with Valibot, and zero implicit any types.",
      colorClass: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    });
  }

  const allFeatures = [...typeFeatures, ...baseFeatures, ...tagFeatures].slice(
    0,
    6
  );

  return (
    <section
      aria-labelledby="features-grid-heading"
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="features-grid-heading"
          className="text-2xl sm:text-3xl font-bold font-paras text-white"
        >
          What&apos;s Included in this Template
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Production-engineered capabilities delivered straight out of the box.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
        {allFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="group relative p-5 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`size-10 sm:size-11 rounded-xl bg-gradient-to-br ${feature.colorClass} border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="size-5" />
                  </div>
                  {feature.badge && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                      {feature.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2 font-paras group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
