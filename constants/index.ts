import { Step } from "@/types";

export const NavigationLinks = [
  {
    id: 0,
    text: "Home",
    link: "/",
  },
  {
    id: 1,
    text: "Templates",
    link: "/templates",
  },
  {
    id: 2,
    text: "Blog",
    link: "/blog",
  },
  {
    id: 3,
    text: "Pricing",
    link: "/pricing",
  },
  {
    id: 4,
    text: "Support",
    link: "/support",
  },
] as const;

export const FooterLinks = [
  {
    id: 0,
    text: "Home",
    link: "/",
  },
  {
    id: 1,
    text: "Templates",
    link: "/templates",
  },
  {
    id: 2,
    text: "Blog",
    link: "/blog",
  },
  {
    id: 3,
    text: "Pricing",
    link: "/pricing",
  },
  {
    id: 4,
    text: "FAQs",
    link: "/faqs",
  },
  {
    id: 5,
    text: "Support",
    link: "/support",
  },
  {
    id: 6,
    text: "Custom Development",
    link: "/custom-development",
  },
] as const;

export const HeroItems = [
  {
    id: 1,
    title: "Beautifully Crafted Designs",
    desc: "Designed in Figma to help you stand out—perfect for startups, agencies, and design-forward teams.",
  },
  {
    id: 2,
    title: "Production-Ready Code Templates",
    desc: "Built with top JavaScript frameworks like React, Next.js, and TypeScript for developers who want to ship fast.",
  },
  {
    id: 3,
    title: "Customize in Minutes, Not Months",
    desc: "Full Framer integration means drag-and-drop simplicity—no fighting with builders, just customizing.",
  },
] as const;

export const featuresBusinessSales = [
  {
    iconPath: "/assets/Icons/paypal.svg",
    text: "You received 1000$ from John!",
  },
  {
    iconPath: "/assets/Icons/stripe.svg",
    text: "You received a payment of $5,987!",
  },
  {
    iconPath: "/assets/Icons/wh.avif",
    text: "Woohoo! You made a sale!",
  },
] as const;

export const codeFeatures = [
  {
    icon: "Code2",
    title: "Next-Gen Frameworks",
    description:
      "Cutting-edge template built with React, Next.js, and TypeScript for lightning-fast development.",
  },
  {
    icon: "Blocks",
    title: "Scalable Architecture",
    description:
      "Crafted with modular, reusable components following industry-leading best practices.",
  },
  {
    icon: "Shield",
    title: "Battle-Tested Code",
    description:
      "Production-ready, secure, and optimized template that are trusted for real-world deployments.",
  },
  {
    icon: "Cpu",
    title: "Blazing Performance",
    description:
      "Ultra-fast template engineered for SEO, accessibility, and modern performance standards.",
  },
] as const;

export const figmaFeatures = [
  {
    icon: "Palette",
    title: "Design Systems",
    description:
      "Complete design systems with components, colors, and typography",
  },
  {
    icon: "Layers",
    title: "Component Libraries",
    description: "Reusable components for faster design workflow",
  },
  {
    icon: "MousePointer",
    title: "Interactive Prototypes",
    description: "Ready-to-use prototypes with micro-interactions",
  },
  {
    icon: "Smartphone",
    title: "Multi-Device Layouts",
    description: "Responsive designs for all screen sizes",
  },
] as const;

export const socialImgs = [
  {
    name: "Instagram",
    Icon: "Instagram",
    link: "https://www.instagram.com/__m4_e__/",
  },
  {
    name: "Linkedin",
    Icon: "Linkedin",
    link: "https://www.linkedin.com/in/1-mohammed",
  },
] as const;

export const DashboardSidebarLinks = [
  {
    Icon: "LayoutDashboard",
    text: "Dashboard",
    link: "/dashboard",
  },
  {
    Icon: "Templates",
    text: "Purchased Templates",
    link: "/dashboard/purchased-templates",
  },
  {
    Icon: "Headset",
    text: "Support",
    link: "/dashboard/support",
  },
  {
    Icon: "Settings",
    text: "Settings",
    link: "/dashboard/settings",
  },
] as const;

export const AdminSidebarLinks = [
  {
    Icon: "LayoutDashboard",
    text: "Dashboard",
    link: "/admin",
  },
  {
    Icon: "Users",
    text: "Users",
    link: "/admin/users",
  },
  {
    Icon: "Templates",
    text: "Templates",
    link: "/admin/templates",
  },
  {
    Icon: "FolderOpen",
    text: "Categories",
    link: "/admin/categories",
  },
  {
    Icon: "Blocks",
    text: "Blog",
    link: "/admin/blogs",
  },
  {
    Icon: "HelpCircle",
    text: "FAQs",
    link: "/admin/faqs",
  },
  {
    Icon: "Download",
    text: "Downloads",
    link: "/admin/download-logs",
  },
  {
    Icon: "AlertCircle",
    text: "Error Logs",
    link: "/admin/error-logs",
  },
  {
    Icon: "Analytics",
    text: "Analytics",
    link: "/admin/analytics",
  },
  {
    Icon: "Headset",
    text: "Support",
    link: "/admin/support",
  },
  {
    Icon: "Zap",
    text: "Performance",
    link: "/admin/performance",
  },
] as const;

export const passwordRequirements = (password: string) =>
  [
    {
      text: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      text: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      text: "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      text: "Contains number",
      met: /\d/.test(password),
    },
  ] as const;

export const whatLoseWhenDeleteMyAccount = [
  "You'll lose all your purchased template.",
  "You won't be able to access your order history or download links.",
  "You’ll lose access to your saved template and account-related features.",
] as const;

export const Gradients = [
  "from-blue-500 via-purple-500 to-pink-500",
  "from-green-500 via-teal-500 to-blue-500",
  "from-orange-500 via-red-500 to-pink-500",
  "from-purple-500 via-indigo-500 to-blue-500",
] as const;

export const Icons = ["Zap", "ExternalLink", "Palette", "Code"] as const;

// About Me
export const stats = [
  { label: "Templates Created", value: "10+", icon: "Code" },
  { label: "Happy Customers", value: "1K+", icon: "Users" },
  { label: "Downloads", value: "2K+", icon: "Download" },
  { label: "5-Star Reviews", value: "98%", icon: "Star" },
] as const;

export const skills = [
  { name: "React & Next.js", level: 99, color: "from-blue-500 to-cyan-500" },
  { name: "Node JS & Express", level: 96, color: "from-green-500 to-teal-500" },
  {
    name: "Databases (MongoDB, PostgreSQL, Supabase)",
    level: 94,
    color: "from-indigo-500 to-blue-500",
  },
  // {name: "UI/UX Design", level: 90, color: "from-purple-500 to-pink-500"},
  { name: "Tailwind CSS", level: 99, color: "from-green-500 to-teal-500" },
  { name: "GSAP", level: 94, color: "from-orange-500 to-red-500" },
  // { name: "Figma Design", level: 92, color: "from-indigo-500 to-purple-500" },
  // { name: "GSAP Animations", level: 88, color: "from-pink-500 to-rose-500" },
] as const;

export const badges = [
  // { text: "Top Seller", icon: Award, gradient: "from-yellow-400 to-orange-500" },
  // { text: "Design Expert", icon: "Palette", gradient: "from-purple-500 to-pink-500" },
  { text: "Code Wizard", icon: "Zap", gradient: "from-blue-500 to-cyan-500" },
  {
    text: "Innovation Leader",
    icon: "Rocket",
    gradient: "from-green-500 to-teal-500",
  },
  // { text: "Customer Favorite", icon: Heart, gradient: "from-red-500 to-pink-500" },
  {
    text: "Quality Focused",
    icon: "Target",
    gradient: "from-indigo-500 to-purple-500",
  },
] as const;

export const STEPS: Step[] = [
  {
    key: "buy",
    title: "Buy Template",
    description:
      "Get lifetime access to the code. No recurring subscriptions, just a one-time purchase for full ownership.",
    color: "#34d399",
  },
  {
    key: "download",
    title: "Instant Download",
    description:
      "Receive your files immediately. The zip contains everything you need: source code, assets, and config.",
    color: "#38bdf8",
  },
  {
    key: "setup",
    title: "Setup Guide",
    description:
      "Follow the comprehensive docs to deploy. I provide step-by-step instructions for Vercel, Netlify, and more.",
    color: "#a78bfa",
  },
  {
    key: "customize",
    title: "Need Customization?",
    description:
      "If you need a backend built or the design tailored to your specific brand, book a quick call.",
    color: "#f472b6",
    optional: true,
  },
  {
    key: "launch",
    title: "Launch",
    description:
      "Go live with your new site in record time. Impress your clients and customers with a premium web experience.",
    color: "#fbbf24",
  },
] as const;
