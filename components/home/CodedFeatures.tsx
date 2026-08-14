"use client";

import { useState } from "react";
import { Code2 } from "@/components/ui/svgs/icons/Code2";
import SplitText from "../ui/SplitText";
import { codeFeatures } from "@/constants/features";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

interface SnippetTab {
  id: string;
  name: string;
  lang: string;
  lines: { tokens: { text: string; color?: string }[] }[];
}

const VSCODE_SNIPPETS: SnippetTab[] = [
  {
    id: "app-router",
    name: "page.tsx",
    lang: "Next.js 16 • React 19",
    lines: [
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "Suspense", color: "text-yellow-300" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "react"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "Hero", color: "text-yellow-300" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/components/Hero"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "ProductGrid", color: "text-yellow-300" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/components/ProductGrid"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "getFeaturedTemplates", color: "text-blue-400" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/lib/templates"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "export default async function", color: "text-purple-400" },
          { text: " " },
          { text: "StorePage", color: "text-blue-300 font-bold" },
          { text: "() {" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "const", color: "text-purple-400" },
          { text: " templates = " },
          { text: "await", color: "text-purple-400" },
          { text: " " },
          { text: "getFeaturedTemplates", color: "text-blue-400" },
          { text: "();" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "return", color: "text-purple-400" },
          { text: " (" },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "<", color: "text-gray-500" },
          { text: "main", color: "text-cyan-400" },
          { text: " " },
          { text: "className", color: "text-sky-300" },
          { text: "=" },
          { text: '"flex flex-col gap-16 min-h-screen"', color: "text-emerald-400" },
          { text: ">", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "      " },
          { text: "<", color: "text-gray-500" },
          { text: "Hero", color: "text-yellow-300" },
          { text: " />", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "      " },
          { text: "<", color: "text-gray-500" },
          { text: "Suspense", color: "text-yellow-300" },
          { text: " " },
          { text: "fallback", color: "text-sky-300" },
          { text: "={" },
          { text: "<", color: "text-gray-500" },
          { text: "ProductGrid.Skeleton", color: "text-yellow-300" },
          { text: " />", color: "text-gray-500" },
          { text: "}>" },
        ],
      },
      {
        tokens: [
          { text: "        " },
          { text: "<", color: "text-gray-500" },
          { text: "ProductGrid", color: "text-yellow-300" },
          { text: " " },
          { text: "items", color: "text-sky-300" },
          { text: "={" },
          { text: "templates", color: "text-white" },
          { text: "} />" },
        ],
      },
      {
        tokens: [
          { text: "      " },
          { text: "</", color: "text-gray-500" },
          { text: "Suspense", color: "text-yellow-300" },
          { text: ">", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "</", color: "text-gray-500" },
          { text: "main", color: "text-cyan-400" },
          { text: ">", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: ");" },
        ],
      },
      {
        tokens: [{ text: "}" }],
      },
    ],
  },
  {
    id: "server-action",
    name: "checkout.ts",
    lang: "Server Actions",
    lines: [
      {
        tokens: [
          { text: "'use server'", color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "auth", color: "text-blue-400" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/lib/auth"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "createStripeCheckout", color: "text-blue-400" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/lib/payments"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "export async function", color: "text-purple-400" },
          { text: " " },
          { text: "handlePurchase", color: "text-blue-300 font-bold" },
          { text: "(" },
          { text: "templateId", color: "text-sky-300" },
          { text: ": " },
          { text: "string", color: "text-teal-400" },
          { text: ") {" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "const", color: "text-purple-400" },
          { text: " session = " },
          { text: "await", color: "text-purple-400" },
          { text: " " },
          { text: "auth", color: "text-blue-400" },
          { text: "();" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "if", color: "text-purple-400" },
          { text: " (!session?.user) " },
          { text: "throw new", color: "text-purple-400" },
          { text: " " },
          { text: "Error", color: "text-yellow-300" },
          { text: "(" },
          { text: '"Unauthorized"', color: "text-emerald-400" },
          { text: ");" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "const", color: "text-purple-400" },
          { text: " checkoutUrl = " },
          { text: "await", color: "text-purple-400" },
          { text: " " },
          { text: "createStripeCheckout", color: "text-blue-400" },
          { text: "({" },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "userId", color: "text-sky-300" },
          { text: ": session.user.id," },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "templateId", color: "text-sky-300" },
          { text: "," },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "successUrl", color: "text-sky-300" },
          { text: ": " },
          { text: "'/dashboard/downloads'", color: "text-emerald-400" },
          { text: "," },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "});" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "return", color: "text-purple-400" },
          { text: " { redirectUrl: checkoutUrl };" },
        ],
      },
      {
        tokens: [{ text: "}" }],
      },
    ],
  },
  {
    id: "tailwind-v4",
    name: "theme.css",
    lang: "Tailwind CSS v4",
    lines: [
      {
        tokens: [
          { text: "@import", color: "text-purple-400" },
          { text: ' "tailwindcss"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "@plugin", color: "text-purple-400" },
          { text: ' "tailwindcss-animate"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "@theme", color: "text-pink-400 font-bold" },
          { text: " {" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-primary", color: "text-sky-300" },
          { text: ": " },
          { text: "#0d0f19", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-card", color: "text-sky-300" },
          { text: ": " },
          { text: "#15161b", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-neon-cyan", color: "text-sky-300" },
          { text: ": " },
          { text: "#06b6d4", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-electric-violet", color: "text-sky-300" },
          { text: ": " },
          { text: "#a855f7", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "--animate-border-beam", color: "text-sky-300" },
          { text: ": " },
          { text: "borderBeam 8s linear infinite", color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [{ text: "}" }],
      },
    ],
  },
];

const CodedFeatures = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ".code-section",
      start: "top 85%",
      end: "bottom 30%",
      once: true,
      onEnter: () => {
        const codeTl = gsap.timeline();

        const codeChars = document.querySelectorAll(".code-title .char");
        codeTl.fromTo(
          codeChars,
          { opacity: 0, y: 100, rotationX: -90 },
          {
            duration: 0.8,
            y: 0,
            opacity: 1,
            rotationX: 0,
            stagger: 0.02,
            ease: "power3.out",
          }
        );

        codeTl.fromTo(
          ".code-feature",
          { opacity: 0, y: 50 },
          {
            duration: 0.6,
            y: 0,
            opacity: 1,
            stagger: 0.04,
            ease: "power2.out",
          },
          "-=0.3"
        );

        codeTl.fromTo(
          ".code-preview",
          { opacity: 0, y: 60, scale: 0.98 },
          {
            duration: 0.7,
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "power3.out",
          },
          "-=0.4"
        );
      },
    });
  }, []);

  const handleCopy = () => {
    const rawText = VSCODE_SNIPPETS[activeTab].lines
      .map((l) => l.tokens.map((t) => t.text).join(""))
      .join("\n");
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="code-section relative z-10 px-6 py-12"
      aria-labelledby="coded-features-title"
    >
      <div
        className="absolute top-1/2 start-0 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2
            id="coded-features-title"
            className="code-title text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-6 font-paras"
          >
            <span className="relative">
              {SplitText("Production-Ready")}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"
              />
            </span>{" "}
            {SplitText("Architecture")}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Skip boilerplate setup. Every template is engineered by senior developers with Next.js 16, strict TypeScript types, server components, and enterprise architecture.
          </p>
        </div>

        {/* 4 Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {codeFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="code-feature group relative text-center rounded-2xl p-px bg-white/[0.06] hover:bg-white/[0.15] transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              >
                <div className="h-full w-full rounded-2xl bg-[#15161b]/90 border border-white/10 p-6 flex flex-col items-center justify-between transition-all duration-300">
                  <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center ring-4 ring-emerald-400/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                    <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-paras font-bold text-white mb-2 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive VS Code Studio Playground */}
        <div className="code-preview relative overflow-hidden rounded-3xl glass-strong border border-white/15 p-4 sm:p-8 max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="relative overflow-hidden rounded-2xl bg-[#090a0f] border border-white/10 shadow-2xl">
            {/* Window Topbar with VS Code Tabs */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#11131a] border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex space-x-2" aria-hidden="true">
                  <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                  <div className="w-3 h-3 bg-green-500/80 rounded-full" />
                </div>
                {/* Switcher Tabs */}
                <div className="flex space-x-1 ms-2">
                  {VSCODE_SNIPPETS.map((snippet, idx) => (
                    <button
                      key={snippet.id}
                      onClick={() => setActiveTab(idx)}
                      className={`px-3 py-1 text-xs font-mono rounded-md transition-all duration-200 cursor-pointer ${
                        activeTab === idx
                          ? "bg-white/15 text-white font-bold border border-white/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {snippet.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs uppercase tracking-wider text-purple-400 font-mono font-medium">
                  {VSCODE_SNIPPETS[activeTab].lang}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-md text-xs font-mono bg-white/10 hover:bg-white/20 text-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                  aria-label="Copy code snippet"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* VS Code Line-Numbered & Highlighted Body */}
            <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed bg-[#0b0c13]">
              <table className="w-full border-collapse">
                <tbody>
                  {VSCODE_SNIPPETS[activeTab].lines.map((line, lineIndex) => (
                    <tr key={lineIndex} className="hover:bg-white/[0.03]">
                      <td className="pe-4 py-0.5 text-right text-gray-600 select-none font-mono text-[11px] w-6 shrink-0 align-top">
                        {lineIndex + 1}
                      </td>
                      <td className="py-0.5 whitespace-pre font-mono text-gray-200">
                        {line.tokens.map((token, tokenIdx) => (
                          <span key={tokenIdx} className={token.color || "text-gray-300"}>
                            {token.text}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/templates"
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Code2 className="w-5 h-5" aria-hidden="true" />
                Browse Code Templates
              </span>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodedFeatures;
