import { Code2 } from "@/components/ui/svgs/icons/Code2";
import { Blocks } from "@/components/ui/svgs/icons/Blocks";
import { Shield } from "@/components/ui/svgs/icons/Shield";
import { Cpu } from "@/components/ui/svgs/icons/Cpu";
import { Palette } from "@/components/ui/svgs/icons/Palette";
import { Layers } from "@/components/ui/svgs/icons/Layers";
import { MousePointer } from "@/components/ui/svgs/icons/MousePointer";
import { Smartphone } from "@/components/ui/svgs/icons/Smartphone";
import { Code } from "@/components/ui/svgs/icons/Code";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Star } from "@/components/ui/svgs/icons/Star";
import { Zap } from "@/components/ui/svgs/icons/Zap";
import { Rocket } from "@/components/ui/svgs/icons/Rocket";
import { Target } from "@/components/ui/svgs/icons/Target";

export const HeroItems = [
  { id: 1, title: "Beautifully Crafted Designs", desc: "Designed in Figma to help you stand out—perfect for startups, agencies, and design-forward teams." },
  { id: 2, title: "Production-Ready Code Templates", desc: "Built with top JavaScript frameworks like React, Next.js, and TypeScript for developers who want to ship fast." },
  { id: 3, title: "Customize in Minutes, Not Months", desc: "Full Framer integration means drag-and-drop simplicity—no fighting with builders, just customizing." },
] as const;

export const featuresBusinessSales = [
  { iconPath: "/assets/Icons/paypal.svg", text: "You received 1000$ from John!" },
  { iconPath: "/assets/Icons/stripe.svg", text: "You received a payment of $5,987!" },
  { iconPath: "/assets/Icons/wh.avif", text: "Woohoo! You made a sale!" },
] as const;

export const codeFeatures = [
  { icon: Code2, title: "Next-Gen Frameworks", description: "Cutting-edge template built with React, Next.js, and TypeScript for lightning-fast development." },
  { icon: Blocks, title: "Scalable Architecture", description: "Crafted with modular, reusable components following industry-leading best practices." },
  { icon: Shield, title: "Battle-Tested Code", description: "Production-ready, secure, and optimized template that are trusted for real-world deployments." },
  { icon: Cpu, title: "Blazing Performance", description: "Ultra-fast template engineered for SEO, accessibility, and modern performance standards." },
] as const;

export const figmaFeatures = [
  { icon: Palette, title: "Design Systems", description: "Complete design systems with components, colors, and typography" },
  { icon: Layers, title: "Component Libraries", description: "Reusable components for faster design workflow" },
  { icon: MousePointer, title: "Interactive Prototypes", description: "Ready-to-use prototypes with micro-interactions" },
  { icon: Smartphone, title: "Multi-Device Layouts", description: "Responsive designs for all screen sizes" },
] as const;

export const stats = [
  { label: "Templates Created", value: "10+", icon: Code },
  { label: "Happy Customers", value: "1K+", icon: Users },
  { label: "Downloads", value: "2K+", icon: Download },
  { label: "5-Star Reviews", value: "98%", icon: Star },
] as const;

export const skills = [
  { name: "React & Next.js", level: 99, color: "from-blue-500 to-cyan-500" },
  { name: "Node JS & Express", level: 96, color: "from-green-500 to-teal-500" },
  { name: "Databases (MongoDB, PostgreSQL, Supabase)", level: 94, color: "from-indigo-500 to-blue-500" },
  { name: "Tailwind CSS", level: 99, color: "from-green-500 to-teal-500" },
  { name: "GSAP", level: 94, color: "from-orange-500 to-red-500" },
] as const;

export const badges = [
  { text: "Code Wizard", icon: Zap, gradient: "from-blue-500 to-cyan-500" },
  { text: "Innovation Leader", icon: Rocket, gradient: "from-green-500 to-teal-500" },
  { text: "Quality Focused", icon: Target, gradient: "from-indigo-500 to-purple-500" },
] as const;
