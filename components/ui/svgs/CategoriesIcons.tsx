import React from "react";
import { Grid } from "@/components/ui/svgs/icons/Grid";
import { NextJS } from "@/components/ui/svgs/icons/NextJS";
import { Vite } from "@/components/ui/svgs/icons/Vite";

export const ReactIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-11.5 -10.23174 23 20.46348"
    fill="currentColor"
    className={className}
  >
    <circle cx="0" cy="0" r="2.05" />
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

export const FeaturedIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const AgencyIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

export const LandingPage = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <circle cx="6" cy="6" r="1" />
    <circle cx="9" cy="6" r="1" />
    <rect x="7" y="13" width="10" height="3" rx="0.5" />
    <path d="M7 19h6" />
  </svg>
);

export const PortfolioIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const CATEGORY_ICONS: Record<
  string,
  React.FC<{ className?: string }>
> = {
  featured: FeaturedIcon,
  agency: AgencyIcon,
  portfolio: PortfolioIcon,
  generic: Grid,
  "landing-page": LandingPage,
  react: ReactIcon,
  nextjs: NextJS,
  vite: Vite,
};

export const getCategoryIcon = (
  iconName?: string | null,
): React.FC<{ className?: string }> => {
  if (!iconName) return Grid;
  return CATEGORY_ICONS[iconName?.toLowerCase()] || Grid;
};
