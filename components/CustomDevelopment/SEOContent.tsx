"use client";

import { Check } from "@/components/ui/svgs/icons/Check";

const SEOContent = () => {
  return (
    <section className="py-16 px-4 w-full max-w-4xl mx-auto border-y border-white/10">
      <div className="prose prose-invert prose-lg max-w-none text-gray-300">
        <h2 className="text-3xl font-bold font-paras text-white mb-8">
          Why Hire a Next.js Developer for Custom React Development?
        </h2>
        <p className="mb-6">
          In today's fast-paced digital landscape, having a website that loads instantly and performs seamlessly is no longer just a luxury—it's a requirement for high conversion rates. If you are looking to elevate your brand beyond a standard template, you need a custom-built solution. That is exactly what our <strong>custom Next.js development service</strong> provides.
        </p>

        <h3 className="text-2xl font-bold text-white mb-6 mt-12">
          Custom Build vs. Off-the-Shelf Template
        </h3>
        <p className="mb-6">
          A premium template is the right choice when you need to ship fast and your product needs fit a well-defined mold. However, every business eventually encounters requirements that no template can address: multi-tenant architectures, deeply integrated payment flows, real-time features, or proprietary design languages. When you <strong>hire our team for custom React development</strong>, you are investing in a product tailored to your exact workflow. We handle the heavy lifting of backend integration, database management, and complex state management, freeing you to focus on growing your business.
        </p>
        <p className="mb-6">
          The result is a codebase that is yours—documented, maintainable, and built to scale. No hidden licensing restrictions, no mystery vendor lock-in, and no fighting against a template's assumptions.
        </p>

        <h3 className="text-2xl font-bold text-white mb-6 mt-12">
          What Makes Our Work Different
        </h3>
        <ul className="space-y-4 mb-8 list-none pl-0">
          <li className="flex items-start gap-3">
            <Check className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
            <div>
              <strong className="text-white block">Performance-First Engineering</strong>
              We target 90+ Lighthouse scores on every delivery. Image optimization, code splitting, edge caching, and font subsetting are default—not afterthoughts.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
            <div>
              <strong className="text-white block">SEO Built Into the Foundation</strong>
              Server components, dynamic metadata, structured data (JSON-LD), and canonical URLs are wired in from day one so you rank before you launch a single campaign.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
            <div>
              <strong className="text-white block">Motion & Interaction Design</strong>
              We use GSAP and Framer Motion to craft scroll-triggered animations and micro-interactions that make your product feel alive and premium, not just functional.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
            <div>
              <strong className="text-white block">Transparent, Fixed-Scope Pricing</strong>
              No surprise invoices. Every project starts with a clear scope document and a fixed price—starting from $599—so you know exactly what you are getting before a single line of code is written.
            </div>
          </li>
        </ul>

        <h3 className="text-2xl font-bold text-white mb-6 mt-12">
          Limited Slots — Apply Early
        </h3>
        <p className="mb-6">
          We maintain a boutique approach to custom development, taking on only a limited number of clients per month to guarantee dedicated focus and premium quality. This means we can give every project the attention it deserves—and it means slots fill up fast. If you have a project in mind, the best time to reach out is now.
        </p>
      </div>
    </section>
  );
};

export default SEOContent;
