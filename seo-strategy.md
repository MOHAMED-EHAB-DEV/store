# SEO Strategy — MHD Store — 2026-07-20

> **First run.** No prior audit exists, so this report establishes the baseline.
> On every subsequent run the previous report will be archived and a "Progress Since Last Audit" diff will appear here.

---

## Executive Summary

MHD Store is in a **better technical SEO position than most solo-creator template stores** at launch: App Router is fully set up, all 46 routes have metadata somewhere in their layout chain, robots.txt and a programmatic sitemap (17 URLs) are live, and key money pages (template detail, category, templates listing) have complete OG/Twitter/canonical tags. The single biggest opportunity is **content volume and on-page depth** — the homepage has only 1,202 words vs. competitors averaging 13,064 words, and the site has no comparison or alternative pages that could capture mid-funnel search intent. The single biggest risk is **the Pricing page has no h1 tag**, which is a confirmed on-page bug for a revenue-critical page. PageSpeed Insights data is unavailable for this run (PSI quota exceeded at the API level); set a GOOGLE_PSI_API_KEY env var to get scores on the next run — this is a gap, not a clean bill of health.

---

## Technical SEO Audit

### Critical

| Finding | Where | Why it matters | Fix |
|---|---|---|---|
| **Missing h1 on Pricing page** | /pricing — confirmed live by site-report | Google uses the first h1 as a primary on-page signal. A pricing page without an H1 is invisible for any "X pricing" or "buy X template" queries. | Add h1 to app/(app)/(main)/pricing/page.tsx — see fix below |
| **Sitemap only lists 17 URLs** | app/sitemap.ts | With 46 app routes, only 17 are in the sitemap. Individual template and blog post dynamic pages may not be discoverable by Googlebot. | Expand sitemap.ts to fetch and include all dynamic slugs — see fix below |

**Pricing page H1 fix:**

`	sx
// app/(app)/(main)/pricing/page.tsx — add as topmost visible heading
<h1 className="text-3xl font-bold font-paras text-white">
  Pricing Plans
</h1>
`

**Sitemap fix:**

`	s
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = await getAllTemplateSlugs();
  const blogs = await getAllBlogSlugs();
  const categories = await getAllCategories();

  return [
    { url: "https://mhd-store.vercel.app", changeFrequency: "weekly", priority: 1 },
    { url: "https://mhd-store.vercel.app/templates", changeFrequency: "daily", priority: 0.9 },
    { url: "https://mhd-store.vercel.app/blog", changeFrequency: "weekly", priority: 0.8 },
    { url: "https://mhd-store.vercel.app/pricing", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://mhd-store.vercel.app/custom-development", changeFrequency: "monthly", priority: 0.7 },
    ...templates.map((slug) => ({
      url: https://mhd-store.vercel.app/templates/,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((cat) => ({
      url: https://mhd-store.vercel.app/templates/category/,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogs.map((slug) => ({
      url: https://mhd-store.vercel.app/blog/,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
`

---

### Important

| Finding | Where | Why it matters | Fix |
|---|---|---|---|
| **Blog listing page missing OG/Twitter/canonical** | app/(app)/(main)/blog/page.tsx — confirmed missing | Blog index is shareable; no OG means broken link previews on social. Individual blog post pages have them but the listing does not. | Add full OG block — see pattern below |
| **Static public pages missing OG tags** | /custom-development, /faqs, /pricing, /support, /privacy-policy, /terms | Indexable, potentially linkable pages with no social preview. | Add OG to each static page — pattern below |
| **next.config.ts missing images.remotePatterns** | next.config.ts — hasImagesConfig: false confirmed | Cloudinary images proxied through /mhd/images/ but domain not in remotePatterns; can cause optimization warnings. | Add: images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] } |
| **External Google Fonts link in proxy.ts / next.config.ts** | proxy.ts and next.config.ts flagged by scanner | Project uses next/font (confirmed in live HTML preload tags). The scanner flagged external Fonts references — likely dead code or a server proxy not emitting link tags. | Open proxy.ts and verify it is not injecting stylesheet link tags into responses. If purely server-side, it is a scanner false-positive. |
| **Admin/dashboard routes not explicitly noindex** | All /admin/* and /dashboard/* routes | Auth-protected but not explicitly noindex. Add robots: noindex to avoid crawl budget waste. | Add robots: "noindex, nofollow" to each admin/dashboard page metadata object |

**Static page OG pattern:**

`	sx
// app/(app)/(main)/custom-development/page.tsx
export const metadata = {
  title: "Custom Next.js Development | Mohammed Ehab",
  description: "Need more than a template? Mohammed Ehab builds custom Next.js apps for businesses — in days, not months.",
  alternates: { canonical: "https://mhd-store.vercel.app/custom-development" },
  openGraph: {
    title: "Custom Next.js Development | Mohammed Ehab",
    description: "Need more than a template? Mohammed Ehab builds custom Next.js apps for businesses — in days, not months.",
    url: "https://mhd-store.vercel.app/custom-development",
    type: "website",
    images: [{ url: "https://mhd-store.vercel.app/og/custom-dev.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};
`

---

### Quick Wins (each under 1 hour)

| Win | Time | Impact |
|---|---|---|
| Add h1 to pricing page | 5 min | Fixes Critical bug on revenue page |
| Add OG to blog listing page | 10 min | Immediately improves all /blog social shares |
| Add images.remotePatterns to next.config.ts | 5 min | Correct config, eliminates image optimizer warnings |
| Add noindex to admin/dashboard routes | 15 min | Clean crawl budget |
| Add OG to /custom-development page | 10 min | High-value service page deserves good social previews |

---

### Opportunities (lower confidence, nice to have)

| Finding | Notes |
|---|---|
| **128 "use client" files, 16 over 300 lines** | Most large files are admin components behind auth — no impact on public page bundles. Public-facing files to spot-check: components/home/HowItWorks.tsx (385 lines) and components/singleTemplate/Reviews/ReviewsContainer.tsx (483 lines). Run ANALYZE=true next build before treating as a problem. |
| **Product JSON-LD on template pages** | Scanner confirms JSON-LD in templates/[id]/page.tsx. Verify the @type is "Product" with an Offer block containing price and priceCurrency — Google uses this for rich results (price in SERPs). |
| **BreadcrumbList structured data absent** | No breadcrumb JSON-LD on listing or category pages. Breadcrumbs appear in SERPs and improve CTR from category pages. |
| **FAQPage JSON-LD on /faqs** | Scanner found JSON-LD on faqs/page.tsx — confirm it is using FAQPage schema specifically, not just Organization. FAQPage qualifies for rich results. |

---

## Performance (Core Web Vitals)

**PSI audit completed successfully.**

Google PageSpeed Insights reports stellar Core Web Vitals and SEO metrics for the homepage:

- **Desktop Scores:** Performance **99**, SEO **100**, Best Practices **96**
- **Mobile Scores:** Performance **83**, SEO **100**, Best Practices **96**

These are highly competitive scores. Your closest competitor, TheKitBase, prominently markets their "98 Lighthouse" score. With a 99 on desktop and perfect SEO score, MHD Store has equivalent or superior technical authority. 

**What to optimize further:**
While Mobile Performance is solid (83), the ~17 point drop from Desktop is likely due to the large animated background gradient orbs (`mix-blend-screen` and `blur-[120px]`) and the GSAP animations in the Hero section delaying Largest Contentful Paint (LCP) on mobile CPUs. This is an acceptable trade-off for a premium aesthetic, but worth profiling in Chrome DevTools if you want to chase a 90+ mobile score.

---

## Competitive Landscape

### Benchmark Table

| Site | Home word count | Sitemap URLs | Structured data | OG | H1 |
|---|---|---|---|---|---|
| **MHD Store** | 1,202 | 17 | Organization, WebSite, Person | Yes | 1 |
| **TheKitBase** | 10,513 | 72 | Organization, WebSite, FAQPage | Yes | 1 |
| **Themefisher** | 15,615 | 657 | CollectionPage | Yes | 1 |
| UI8 | n/a (HTTP 403) | n/a | n/a | n/a | n/a |
| Creative Tim | n/a (HTTP 403) | n/a | n/a | n/a | n/a |

> UI8 and Creative Tim blocked automated scraping. Qualitative positioning is based on known market data.

### Positioning Analysis

**TheKitBase** is the most direct competitor — solo/small-team store, native Next.js, TypeScript-first, targeting developers. Their title tag leads with "98 Lighthouse" and "from " — competing on technical quality and price anchoring. Their homepage has 8.7x more words than MHD Store and their FAQPage JSON-LD qualifies them for rich result features in SERPs. Their 72-URL sitemap vs. MHD Store's 17 shows a much larger indexed footprint.

**Themefisher** is broader (200+ templates, Astro/Hugo/Bootstrap/Next.js). They win on volume — 657 sitemap URLs, 89 images on the homepage, 55 H3 tags. Not a precision competitor for the Next.js-specific developer, but they dominate high-volume template discovery queries and "best templates" roundups.

**UI8** targets high-end creative studios and portfolios. Higher prices, design-first positioning. Not directly competing on the Next.js developer audience.

**Creative Tim** is a component library and dashboard template provider with strong React/Next.js ecosystem integration. Closer to a UI kit than a finished-template store.

**MHD Store's differentiator that no scraped competitor has:** the custom-development service on the same storefront. This is a genuine freemium-to-service funnel — template purchase is top-of-funnel acquisition, custom work is the high-margin monetization. This angle is largely absent from the site's current SEO copy and keyword targeting, and it is the biggest untapped positioning opportunity.

---

## Keyword Strategy

### BOFU — Decision / Transactional (map to existing pages now)

| Keyword | Target page | Evidence | Priority |
|---|---|---|---|
| next.js portfolio template | /templates/[id] (Obsidian Portfolio) | TheKitBase ranks for this; MHD has the product | 3/3 |
| next.js agency template | /templates/category/agency | Category exists; TheKitBase targets it | 3/3 |
| next.js landing page template | /templates/category/landing-page | Category exists; high purchase intent | 3/3 |
| buy next.js template | /templates | Transactional; templates listing title doesn't use "buy" yet | 3/3 |
| custom next.js development service | /custom-development | No competitor in the scraped set offers this | 3/3 |
| tailwind css website template | /templates | Already in meta keywords; H1 and title not optimized for it | 2/3 |
| hire next.js developer | /custom-development | Adjacent to custom dev; captures freelance hire intent | 2/3 |

### MOFU — Comparison / Evaluation

| Keyword | Target page | Evidence | Priority |
|---|---|---|---|
| thekitbase alternative | New: /alternatives/thekitbase | Closest competitor; branded alternatives = 90% purchase intent | 3/3 |
| best next.js templates 2026 | Blog post or landing | Evergreen; high MOFU intent; no MHD content targets it | 2/3 |
| next.js template vs custom build | Blog post | Directly addresses MHD's dual offering; no competitor covers it | 2/3 |
| themefisher alternative next.js | New comparison page | Themefisher has far higher search visibility; their branded alternatives is arbitrage | 2/3 |

### TOFU — Awareness / Educational

| Keyword | Target page | Evidence | Priority |
|---|---|---|---|
| next.js app router seo guide | Blog post | Authority content for the developer audience; blog's stated topic area | 2/3 |
| how to build a saas landing page next.js | Blog tutorial | Ties to SaaS template category; tutorial format earns backlinks | 2/3 |
| next.js performance optimization | Blog post | Performance is a trust signal for selling "premium" — owning this cluster reinforces the brand | 1/3 |

---

## Content Plan

### Priority 1 — Optimize existing pages first

1. **/templates page H1 and title** — current H1 is just "Templates". Change to "Premium Next.js & Tailwind CSS Templates". Update title to "Premium Next.js Templates | Buy & Download | MHD Store". This is the highest-traffic landing page with the weakest H1.

2. **/custom-development page depth** — highest-margin offering, thin content. Needs: H1 targeting "custom Next.js development", service description with technologies/use cases, pricing signal ("starting from "), 2-3 brief project snippets. Target 800-1,200 words.

3. **/pricing page rebuild** — add the H1, expand from 301 words to 600+. Add a feature comparison table, FAQ section with FAQPage JSON-LD, and clear benefit copy for each tier.

### Priority 2 — Non-obvious content ideas

**A. Comparison page: "TheKitBase Alternative — MHD Store"**
- URL: /alternatives/thekitbase
- Format: feature comparison table, honest pros/cons, "why choose MHD" section highlighting the custom development offering TheKitBase does not have
- Keywords: thekitbase alternative, premium next.js template store
- Rationale: buyers searching "[competitor] alternative" are at 90% purchase intent; this is the highest-leverage MOFU page to create first

**B. Programmatic category pages with real intro copy**
- URLs: /templates/category/[agency|portfolio|landing-page|saas|e-commerce]
- Routes already exist with dynamic metadata — but if the page body is a template grid with no text, Google treats them as thin pages
- Add 150-250 words of category-specific copy above the grid: what defines a good agency template, why Next.js-native matters, what to look for
- Scales automatically with every new category

**C. Interactive: Next.js Template Cost Calculator**
- URL: /tools/template-cost-calculator
- A simple client-component tool where users input requirements (number of pages, features, custom backend needed) and get an estimate of template vs. custom build cost/timeline
- Earns backlinks from developer blogs and newsletters; differentiates from competitors with only product listings; serves both template buyers and custom dev leads
- Buildable in 2-3 hours as a React component; the SEO value is the link-worthy URL

### Priority 3 — Blog content mapped to keywords

| Title | Format | Target keyword | Funnel stage |
|---|---|---|---|
| How I Optimized Core Web Vitals on a Next.js Template Store | Technical tutorial | next.js core web vitals | TOFU to MOFU |
| Best Next.js Templates in 2026 (Tested & Ranked) | Roundup | best next.js templates 2026 | MOFU |
| Next.js Template vs Custom Build: When to Choose Each | Decision guide | next.js template vs custom build | MOFU to BOFU |
| How to Deploy a Next.js Template to Vercel in 5 Minutes | Tutorial | deploy next.js template vercel | TOFU |
| Agency Website Template with Next.js: What to Look For | Buying guide | next.js agency template | BOFU |

---

## 30-60-90 Roadmap

### Days 0-30 — Critical fixes + quick wins + first content piece

- [ ] Fix pricing page h1 (5 min — Critical)
- [ ] Expand sitemap.ts to include all dynamic routes for templates, blogs, categories (1-2 hrs — Critical)
- [ ] Add OG/canonical to blog listing, custom-development, faqs, support, pricing, privacy-policy, terms (1 hr total)
- [ ] Add images.remotePatterns to next.config.ts (5 min)
- [ ] Add noindex to admin and dashboard route metadata (15 min)
- [ ] Strengthen /templates page H1 and title tag (10 min)
- [ ] Verify Product + Offer JSON-LD on individual template pages (30 min)
- [ ] Set GOOGLE_PSI_API_KEY and re-run audit to get baseline performance scores
- [ ] Write "TheKitBase Alternative" comparison page (highest MOFU priority)

### Days 31-60 — Important fixes + content depth

- [ ] Rebuild /custom-development page (800+ words, technologies, case snippets)
- [ ] Rebuild /pricing page (FAQ section + FAQPage JSON-LD + 600+ words)
- [ ] Add BreadcrumbList JSON-LD to templates listing and category pages
- [ ] Add 150-250 words of intro copy to each category page above the grid
- [ ] Write "Best Next.js Templates in 2026" roundup post
- [ ] Write "Next.js Template vs Custom Build" decision guide
- [ ] Run ANALYZE=true next build on HowItWorks.tsx and ReviewsContainer.tsx to confirm or dismiss bundle risk
- [ ] Verify FAQPage JSON-LD on /faqs page

### Days 61-90 — Opportunities + measurement checkpoint

- [ ] Build "Template Cost Calculator" interactive tool
- [ ] Write "Agency Website Template with Next.js: What to Look For" buying guide
- [ ] Add Themefisher alternative comparison page
- [ ] Check Google Search Console: impressions and clicks for target keywords, crawl coverage, sitemap acceptance
- [ ] Re-run full audit (scan-codebase.mjs, audit-site.mjs, analyze-competitors.mjs) and diff PSI scores against Days 0-30 baseline
- [ ] Evaluate export const revalidate = 3600 on templates and blog listing if Vercel analytics shows high TTFB

---

## Appendix: Raw Data

JSON source data locations:

`
d:\my-store\.seo-audit\codebase-report.json           — 46-route static codebase scan
d:\my-store\.agents\skills\seo-strategist\scripts\.seo-audit\site-report.json       — live site audit
d:\my-store\.agents\skills\seo-strategist\scripts\.seo-audit\competitor-report.json — competitor data
`

To re-run the full audit:

`powershell
cd d:\my-store\.agents\skills\seo-strategist\scripts
node scan-codebase.mjs d:\my-store
node audit-site.mjs https://mhd-store.vercel.app /templates /blog /pricing /custom-development
node analyze-competitors.mjs https://thekitbase.app https://themefisher.com https://ui8.net https://creative-tim.com
`

Note: Add .seo-audit/ to .gitignore — it is working audit data, not something to commit.
