import { Step } from "@/types/step";

export const STEPS: Step[] = [
  {
    key: "buy",
    title: "Buy Template",
    description: "Get lifetime access to the code. No recurring subscriptions, just a one-time purchase for full ownership.",
    color: "#34d399",
  },
  {
    key: "download",
    title: "Instant Download",
    description: "Receive your files immediately. The zip contains everything you need: source code, assets, and config.",
    color: "#38bdf8",
  },
  {
    key: "setup",
    title: "Setup Guide",
    description: "Follow the comprehensive docs to deploy. I provide step-by-step instructions for Vercel, Netlify, and more.",
    color: "#a78bfa",
  },
  {
    key: "customize",
    title: "Need Customization?",
    description: "If you need a backend built or the design tailored to your specific brand, book a quick call.",
    color: "#f472b6",
    optional: true,
  },
  {
    key: "launch",
    title: "Launch",
    description: "Go live with your new site in record time. Impress your clients and customers with a premium web experience.",
    color: "#fbbf24",
  },
] as const;
