---
name: seo-strategist
description: Acts as a senior SEO strategist and full-stack Next.js developer in one — not just a code linter. Scans the project's own codebase for technical SEO signals (metadata, sitemap/robots, structured data, image/font optimization, client-bundle risk), crawls the live deployed site and benchmarks it against competitor URLs (on-page signals + Google PageSpeed Insights/Core Web Vitals), then synthesizes both into a single prioritized report: technical fixes, keyword targets by funnel stage, a content plan, and a 30-60-90 roadmap. Use this skill whenever the user asks for an SEO audit, SEO strategy, SEO review, site audit, technical SEO check, competitor SEO comparison, keyword research, content plan, or Core Web Vitals/performance report for a Next.js site — even if they just paste a URL and ask something like "how's our SEO doing" or "compare us to X". Also trigger when the user wants to find quick wins, improve rankings, or understand why a competitor outranks them.
---

# SEO Strategist (Next.js)

A one-run pipeline that combines static codebase analysis, live site auditing,
and competitor benchmarking into a single strategic report. This is not a
"run eslint for SEO" tool — the deterministic legwork (crawling, scraping,
performance scoring) is delegated to scripts, but the judgment calls
(prioritization, positioning, keyword strategy, content ideas) are yours to
make as the agent, grounded in that data.

## Required inputs

Collect these once, up front, in a single message — do not turn this into a
multi-round interview:

1. **Target URL** — the live deployed site to audit (not localhost).
2. **Project root** — the Next.js project's path, if not already the current
   working directory.
3. **Competitor URLs** — 1 to 5 URLs. The user may also paste qualitative
   notes about competitors (pricing, positioning, audience, reputation) —
   keep that text verbatim, it's not something the scripts can gather and
   it matters for the Competitive Landscape section later.
4. **Optional**: specific seed keywords, business goals, or constraints the
   user wants weighted more heavily.

If the user already supplied some or all of this in their request, do not
re-ask for it — state the assumptions you're making inline and proceed. Only
ask about what's genuinely missing (e.g. no competitor URLs given at all).

This is a **single, uninterrupted run**: once inputs are collected, execute
straight through every phase below to the final report. Do not pause for
approval between phases — that's a different kind of workflow than this one.

## Setup (first time only)

The scripts need one dependency (`cheerio`, for HTML parsing). Before the
first run in a given environment:

```bash
cd <path-to-this-skill>/scripts
npm install
```

This creates a `node_modules` folder scoped to the scripts directory only —
it does not touch or modify the user's own project dependencies.

## Workflow

### Phase 1 — Codebase scan (static, zero network calls)

```bash
node scripts/scan-codebase.mjs <project-root>
```

Writes `<project-root>/.seo-audit/codebase-report.json`. Detects: App Router
vs Pages Router, per-route metadata coverage (including inheritance from
parent layouts), sitemap/robots setup and method, `next.config` image/header/
redirect/compress settings, `next/image` vs raw `<img>` usage and missing
`alt` attributes, `next/font` usage vs external Google Fonts links, JSON-LD
presence, large `"use client"` files, and icon-library barrel-import patterns
that commonly bloat client bundles.

Treat this as a heuristic map, not gospel. It's regex/AST-light by design so
it runs with zero setup — spot-check anything you're about to call
"Critical" by opening the actual file, especially around metadata
inheritance in nested route groups or parallel routes, which the scanner
may not model perfectly.

### Phase 2 — Live site audit (crawl + performance)

```bash
node scripts/audit-site.mjs <target-url> [extra-path ...]
```

Fetches the homepage HTML (and any extra paths you pass — e.g. a key
category or product page worth checking individually), parses on-page SEO
signals, checks for `robots.txt`/`sitemap.xml` at the origin, and runs Google
PageSpeed Insights for both mobile and desktop (Core Web Vitals, category
scores, top opportunities). Writes
`<project-root>/.seo-audit/site-report.json`.

PageSpeed Insights works without an API key at low volume. If the user has
hit rate limits before, they can set `GOOGLE_PSI_API_KEY` as an environment
variable for a higher quota — mention this only if the run actually fails on
quota, don't require it up front.

If PageSpeed Insights fails (timeout, quota, transient error), the script
still completes and records the failure — **say so explicitly in the final
report** rather than silently dropping the performance section.

### Phase 3 — Competitor benchmarking

```bash
node scripts/analyze-competitors.mjs <competitor-url-1> [competitor-url-2 ...]
```

Runs the same on-page audit (mobile-only PageSpeed, to keep the run fast)
against each competitor and computes quick comparison averages. Writes
`<project-root>/.seo-audit/competitor-report.json`. Some sites block
automated requests — if a competitor fetch fails, the report records the
failure per-URL rather than aborting the whole run; note any failures in the
final report instead of ignoring the gap.

### Phase 4 — Synthesis & report writing (this is the real work — do it yourself, don't shortcut it)

Read all three JSON reports, plus:
- `references/technical-seo-checklist.md` — severity/priority scoring for
  technical findings
- `references/nextjs-seo-patterns.md` — concrete code patterns to cite in
  the fixes section
- `references/keyword-strategy-framework.md` — how to bucket, prioritize,
  and go beyond generic keyword lists
- `references/report-template.md` — the exact structure to write

Then write `seo-strategy.md` directly. This is where you add the value the
scripts can't:

- **Prioritize, don't just list.** Use the impact × confidence ÷ effort
  scoring from the checklist reference — the report should read as "fix
  these five things this week," not a raw dump of every finding.
- **Ground every keyword and content idea in evidence** — what the site
  actually sells (inferred from the scraped copy and codebase, not assumed),
  what competitors are doing, and which funnel stage each target serves.
- **Include at least 2-3 non-obvious content or product ideas per run** —
  comparison pages, programmatic SEO opportunities tied to the actual
  catalog/data structure, interactive tools — not just "write more blog
  posts." See the keyword strategy reference for the reasoning.
- **Write technical fixes for a developer** — cite actual file paths from
  the codebase scan and give copy-pasteable code, using the patterns
  reference as a base and adapting it to this project's actual conventions
  (routing style, TypeScript vs JS, existing component patterns).
- **Make each run cumulative.** If `seo-strategy.md` already exists in the
  project root, read it first, archive it to
  `.seo-audit/history/seo-strategy-<date>.md`, and open the new report with
  a "Progress Since Last Audit" section that diffs the key numbers (PSI
  scores, routes missing metadata, structured-data coverage, competitor gap
  closure). This is what makes the skill more useful on every run instead of
  restarting cold each time — mention this explicitly in the executive
  summary so it's visible, not just a background mechanic.

## Output

- **`seo-strategy.md`** in the project root — the one deliverable the user
  reads. This is the whole point of the run.
- **`.seo-audit/*.json`** — raw data backing the report. Keep it; it's what
  powers the diff on the next run. Suggest adding `.seo-audit/` to
  `.gitignore` if it isn't already, since it's working data, not something
  to commit.

## Notes for running under a different model

If this skill is invoked by an agent other than the one it was written with,
keep instructions and outputs generic: plain Markdown, no assumptions about
a specific model's formatting quirks, token limits, or tool-calling style.
The scripts are plain Node.js and behave identically regardless of which
model is orchestrating them.
