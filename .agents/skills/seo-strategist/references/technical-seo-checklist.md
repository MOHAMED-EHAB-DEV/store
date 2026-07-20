# Technical SEO Checklist & Scoring Rubric (Next.js)

Use this to turn raw findings from `codebase-report.json` and `site-report.json`
into a prioritized fix list. Don't just list issues in the order the scanner
found them — rank them.

## Priority score = Impact × Confidence ÷ Effort

Score each finding 1-3 on each axis, then rank high-to-low.

- **Impact**: How much of the site / how much traffic does this touch?
  - 3 = site-wide (missing sitemap, no robots.txt, broken canonical strategy, layout-level metadata gap)
  - 2 = a template/section used across many pages (e.g. all product pages missing OG image)
  - 1 = a single page
- **Confidence**: How sure are we this is actually a problem (not a false positive from the static scan)?
  - 3 = verified by both the codebase scan and the live HTML
  - 2 = only one source flagged it — worth a quick manual check before recommending
  - 1 = heuristic guess (e.g. "large use client file" doesn't always mean a real bundle problem — check if it's actually shipped to the client on the pages that matter)
- **Effort**: Rough dev time to fix.
  - 3 = under an hour (add a meta tag, add alt text, add a canonical)
  - 2 = a few hours (add generateMetadata to a template, wire up next-sitemap)
  - 1 = a real project (migrate off an icon barrel import across the whole codebase, restructure client/server component boundaries)

## Severity buckets for the report

### Critical (fix this week)
- No `robots.txt` or it disallows the whole site
- No sitemap at all (static or programmatic)
- Missing or empty `<title>` / meta description on money pages (home, category, product/service pages)
- Canonical tags missing or pointing to the wrong URL (duplicate content risk)
- PageSpeed Insights performance score in the "red" (<50) range on mobile for the homepage or a key landing page
- A dynamic route (`[slug]`) with no metadata anywhere in its layout chain — every instance of that template ships with generic/duplicate titles

### Important (fix this month)
- Missing Open Graph / Twitter Card tags on shareable pages (blog posts, product pages) — kills link previews on socials
- No structured data (JSON-LD) at all, or missing it on the page types that benefit most (Product, Article, Organization, BreadcrumbList, FAQPage)
- Images missing `alt` text (accessibility + image search)
- H1 count ≠ 1 on a page, or heading levels skipped (h1 → h3 with no h2)
- `next/config` missing `images` config for a site that pulls remote images, or missing security/caching `headers()`
- External Google Fonts `<link>` tag instead of `next/font` (render-blocking, no self-hosting/preload benefit)

### Quick wins (cheap, worth calling out even if impact is moderate)
- Any "Critical" or "Important" item that scores Effort=3 (under an hour) in the rubric above
- Adding `alt` text to a handful of flagged images
- Adding a missing canonical tag
- Enabling `compress: true` in `next.config.js` if missing

### Opportunities / nice-to-have
- Barrel imports from icon libraries (`react-icons` root import, large `lucide-react` named-import statements) — real bundle-bloat risk, but confirm with an actual bundle analysis before treating as certain
- Large `"use client"` files (>300 lines) — flag as a bundle-boundary review candidate, not an automatic verdict; some large client files are legitimately interactive and fine
- INP/CLS/LCP field data trending "AVERAGE" rather than "FAST" (real user Core Web Vitals from PSI `loadingExperience`, when available) — worth tracking over time even if not failing outright

## Caveats to state in the report, not just silently apply

- The codebase scanner is a heuristic, not an AST-accurate tool. A route marked "missing metadata" may actually inherit good metadata from a layout the scanner didn't detect correctly (nested route groups, parallel routes). Spot-check anything you're about to call "Critical."
- PageSpeed Insights lab data (single simulated run) can vary run to run. Field data (`loadingExperience`) is more trustworthy when present — prefer it, and say so when you cite a number.
- If PSI failed to return data (rate limit, timeout), say so explicitly in the report rather than omitting the performance section silently — the user should know it's a gap, not a clean bill of health.
