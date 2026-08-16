"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { HelpCircle } from "@/components/ui/svgs/icons/HelpCircle";

interface TemplateFAQProps {
  templateTitle: string;
  templateType: "coded" | "framer" | "figma";
}

export default function TemplateFAQ({
  templateTitle,
  templateType,
}: TemplateFAQProps) {
  const faqs = [
    {
      id: "commercial-license",
      question: `Can I use ${templateTitle} for commercial client projects?`,
      answer:
        "Yes, absolutely. Every template includes a royalty-free commercial license. You can build websites for your own business or deliver finished projects to clients without paying recurring fees or adding attribution.",
    },
    {
      id: "code-quality-security",
      question: "How secure, clean, and performant is the codebase?",
      answer:
        templateType === "coded"
          ? "The template is engineered with strict TypeScript and modern Next.js App Router best practices. There are zero tracking scripts or hidden bloatware, ensuring clean code audits and 95+ Google Lighthouse scores out of the box."
          : templateType === "framer"
          ? "Built natively in Framer with clean component structures, optimized responsive breakpoints, and fast global CDN hosting."
          : "Designed with professional Figma component architectures, naming conventions, auto-layout 5.0, and strict tokenized variables.",
    },
    {
      id: "business-conversion",
      question: "How will this template help my business convert more visitors?",
      answer:
        "Our templates are designed around conversion architecture: high-contrast call-to-action placements, friction-free mobile navigation, fast loading times that reduce bounce rates, and polished micro-interactions that establish instant credibility with your visitors.",
    },
    {
      id: "customization-ease",
      question: "How easy is it to change brand colors, typography, and content?",
      answer:
        templateType === "coded"
          ? "Extremely straightforward. All design tokens are centralized in Tailwind CSS variables inside globals.css. Swapping brand colors, fonts, or assets takes just a few minutes with full hot-reloading support."
          : templateType === "framer"
          ? "Completely visual. Use Framer's intuitive canvas to swap colors, text, images, and CMS collections with simple drag-and-drop."
          : "Simply update the Figma global color and text style variables to transform the entire design system instantly.",
    },
    {
      id: "tech-stack-requirements",
      question: "What environment or tools do I need to run this?",
      answer:
        templateType === "coded"
          ? "Node.js (v18+) or Bun. You can run 'bun install' or 'npm install' followed by 'bun dev' / 'npm run dev' to launch the project locally within seconds. Deployments to Vercel, Netlify, or AWS are one-click ready."
          : templateType === "framer"
          ? "A free or paid Framer account. Simply remix the project link into your Framer workspace to start customizing."
          : "Figma (desktop or browser app). Duplicate the file into your Figma drafts to access all components and frames.",
    },
    {
      id: "updates-and-support",
      question: "Do I get lifetime updates and technical support?",
      answer:
        "Yes. Your download grants you lifetime access to all future bug fixes, dependency updates, and optimizations for this template. If you ever have a setup question, our support team is available to help.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      aria-labelledby="template-faq-heading"
      className="flex flex-col gap-6 w-full mt-4"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex flex-col gap-1 text-center sm:text-start">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
          <HelpCircle className="size-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2
          id="template-faq-heading"
          className="text-2xl sm:text-3xl font-bold font-paras text-white"
        >
          Everything You Need to Know
        </h2>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 backdrop-blur-xl">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-b border-white/10 last:border-b-0 px-2 py-1"
            >
              <AccordionTrigger className="text-start text-base sm:text-lg font-semibold text-white hover:text-purple-300 transition-colors py-4 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-300 leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
