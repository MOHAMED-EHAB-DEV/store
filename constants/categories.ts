export interface CategoryTheme {
  gradient: string;
  glow: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  iconText: string;
  accentBar: string;
  tags: string[];
  group: "framework" | "archetype";
}

export const THEME_MAP: Record<string, CategoryTheme> = {
  nextjs: {
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
    glow: "rgba(56, 189, 248, 0.15)",
    borderHover: "hover:border-sky-500/40",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-400",
    badgeBorder: "border-sky-500/20",
    iconBg: "bg-sky-500/10 border-sky-500/20",
    iconText: "text-sky-400",
    accentBar: "from-sky-500 via-blue-500 to-indigo-500",
    tags: ["Next.js 16+", "App Router", "Server Actions"],
    group: "framework",
  },
  react: {
    gradient: "from-cyan-400 via-teal-400 to-blue-500",
    glow: "rgba(6, 182, 212, 0.15)",
    borderHover: "hover:border-cyan-500/40",
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconText: "text-cyan-400",
    accentBar: "from-cyan-400 via-teal-400 to-blue-500",
    tags: ["React 19", "Modular Components", "Strict TS"],
    group: "framework",
  },
  vite: {
    gradient: "from-violet-400 via-purple-500 to-amber-400",
    glow: "rgba(168, 85, 247, 0.15)",
    borderHover: "hover:border-purple-500/40",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-400",
    badgeBorder: "border-purple-500/20",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconText: "text-purple-400",
    accentBar: "from-violet-400 via-purple-500 to-amber-400",
    tags: ["Instant HMR", "Zero Bloat", "TypeScript"],
    group: "framework",
  },
  featured: {
    gradient: "from-rose-400 via-pink-500 to-purple-500",
    glow: "rgba(244, 63, 94, 0.15)",
    borderHover: "hover:border-rose-500/40",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/20",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    iconText: "text-rose-400",
    accentBar: "from-rose-400 via-pink-500 to-purple-500",
    tags: ["Top Rated", "Editor's Choice", "Turnkey Code"],
    group: "archetype",
  },
  "landing-page": {
    gradient: "from-fuchsia-400 via-purple-500 to-pink-500",
    glow: "rgba(192, 132, 252, 0.15)",
    borderHover: "hover:border-fuchsia-500/40",
    badgeBg: "bg-fuchsia-500/10",
    badgeText: "text-fuchsia-400",
    badgeBorder: "border-fuchsia-500/20",
    iconBg: "bg-fuchsia-500/10 border-fuchsia-500/20",
    iconText: "text-fuchsia-400",
    accentBar: "from-fuchsia-400 via-purple-500 to-pink-500",
    tags: ["High Conversion", "SEO Score 100", "Micro-Interactions"],
    group: "archetype",
  },
  landing: {
    gradient: "from-fuchsia-400 via-purple-500 to-pink-500",
    glow: "rgba(192, 132, 252, 0.15)",
    borderHover: "hover:border-fuchsia-500/40",
    badgeBg: "bg-fuchsia-500/10",
    badgeText: "text-fuchsia-400",
    badgeBorder: "border-fuchsia-500/20",
    iconBg: "bg-fuchsia-500/10 border-fuchsia-500/20",
    iconText: "text-fuchsia-400",
    accentBar: "from-fuchsia-400 via-purple-500 to-pink-500",
    tags: ["High Conversion", "SEO Score 100", "Micro-Interactions"],
    group: "archetype",
  },
  agency: {
    gradient: "from-emerald-400 via-teal-400 to-cyan-500",
    glow: "rgba(168, 185, 129, 0.15)",
    borderHover: "hover:border-emerald-500/40",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconText: "text-emerald-400",
    accentBar: "from-emerald-400 via-teal-400 to-cyan-500",
    tags: ["Client Showcase", "Service Cards", "CMS Ready"],
    group: "archetype",
  },
  portfolio: {
    gradient: "from-amber-400 via-orange-500 to-yellow-400",
    glow: "rgba(245, 158, 11, 0.15)",
    borderHover: "hover:border-amber-500/40",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/20",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconText: "text-amber-400",
    accentBar: "from-amber-400 via-orange-500 to-yellow-400",
    tags: ["Interactive Works", "Case Studies", "Creative Focus"],
    group: "archetype",
  },
  saas: {
    gradient: "from-blue-400 via-indigo-500 to-violet-500",
    glow: "rgba(99, 102, 241, 0.15)",
    borderHover: "hover:border-indigo-500/40",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/20",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    iconText: "text-indigo-400",
    accentBar: "from-blue-400 via-indigo-500 to-violet-500",
    tags: ["Pricing & Tiers", "Auth & Dashboard", "Stripe Ready"],
    group: "archetype",
  },
  dashboard: {
    gradient: "from-teal-400 via-emerald-500 to-cyan-500",
    glow: "rgba(20, 184, 166, 0.15)",
    borderHover: "hover:border-teal-500/40",
    badgeBg: "bg-teal-500/10",
    badgeText: "text-teal-400",
    badgeBorder: "border-teal-500/20",
    iconBg: "bg-teal-500/10 border-teal-500/20",
    iconText: "text-teal-400",
    accentBar: "from-teal-400 via-emerald-500 to-cyan-500",
    tags: ["Analytics & Charts", "Data Tables", "Dark Mode UI"],
    group: "archetype",
  },
  ecommerce: {
    gradient: "from-pink-400 via-rose-500 to-amber-500",
    glow: "rgba(244, 63, 94, 0.15)",
    borderHover: "hover:border-pink-500/40",
    badgeBg: "bg-pink-500/10",
    badgeText: "text-pink-400",
    badgeBorder: "border-pink-500/20",
    iconBg: "bg-pink-500/10 border-pink-500/20",
    iconText: "text-pink-400",
    accentBar: "from-pink-400 via-rose-500 to-amber-500",
    tags: ["Cart & Checkout", "Product Grids", "Inventory Ready"],
    group: "archetype",
  },
};

export const DEFAULT_CATEGORY_THEME: CategoryTheme = {
  gradient: "from-purple-400 via-pink-400 to-cyan-400",
  glow: "rgba(168, 85, 247, 0.15)",
  borderHover: "hover:border-purple-500/40",
  badgeBg: "bg-purple-500/10",
  badgeText: "text-purple-400",
  badgeBorder: "border-purple-500/20",
  iconBg: "bg-purple-500/10 border-purple-500/20",
  iconText: "text-purple-400",
  accentBar: "from-purple-400 via-pink-400 to-cyan-400",
  tags: ["Production Ready", "100% Responsive", "Modern UI"],
  group: "archetype",
};

export const getCategoryTheme = (slug: string): CategoryTheme => {
  const clean = slug?.toLowerCase().trim();
  return THEME_MAP[clean] || DEFAULT_CATEGORY_THEME;
};

export type CategoryTabFilter = "all" | "frameworks" | "archetypes";
