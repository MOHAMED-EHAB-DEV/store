# seo-strategy.md structure

Write the final report to `seo-strategy.md` in the project root using this
skeleton. Fill every section with specifics pulled from the JSON reports —
never leave a section generic/templated. Omit a section only if there's
truly nothing to say (e.g. no previous audit exists yet, skip "Progress
Since Last Audit" entirely rather than writing a placeholder).

```markdown
# SEO Strategy — [site name] — [date]

## Progress Since Last Audit
<!-- Only include if .seo-audit/history/ has a prior report. Diff the key
     numbers: PSI scores, routes missing metadata, structured data coverage,
     competitor gap closure. Call out what got fixed and what regressed. -->

## Executive Summary
[3-6 sentences: overall state, the single biggest opportunity, the single
biggest risk, and the headline number worth remembering (e.g. mobile
performance score, count of routes missing metadata).]

## Technical SEO Audit

### Critical
[table or list: finding | where | why it matters | fix]

### Important
[same format]

### Quick Wins
[same format — these can overlap with Critical/Important; call them out
separately so the reader knows what to knock out first]

### Opportunities
[same format, lower confidence/impact items]

## Performance (Core Web Vitals)
[Mobile + desktop PSI scores, LCP/CLS/INP/TBT numbers with plain-language
interpretation, top opportunities from PSI, and — if PSI failed — say so
explicitly here rather than omitting the section.]

## Competitive Landscape
[Benchmark table: target vs each competitor across word count, structured
data presence, OG/Twitter coverage, PSI scores, sitemap/robots presence.
Then 3-5 sentences of qualitative positioning informed by whatever the user
told you about each competitor (pricing, audience, reputation) — the scripts
only gathered the technical/on-page data, the positioning read is yours.]

## Keyword Strategy
[Grouped by funnel stage per keyword-strategy-framework.md. Prioritized —
top tier first, clearly marked. Every entry should say *why* (evidence-based,
not generic).]

## Content Plan
[Specific pieces, mapped to keyword targets, with format called out
(article / comparison page / programmatic / interactive tool). Include at
least 2-3 non-generic ideas per the framework.]

## 30-60-90 Roadmap
[Combined technical + content, grouped by timeframe.]

## Appendix: Raw Data
[Pointer to the JSON files in .seo-audit/ for anyone who wants the full
detail, plus a one-line note on how to re-run the audit.]
```

## Archiving previous reports
Before writing a new `seo-strategy.md`, if one already exists:
1. Read it.
2. Copy it to `.seo-audit/history/seo-strategy-<YYYY-MM-DD>.md` (use the
   file's own generation date if embedded, otherwise today's date).
3. Then write the new one, including the "Progress Since Last Audit" section
   at the top, diffing against the archived version.

This is what makes repeated runs cumulative instead of a cold start every
time — say so briefly in the executive summary so the user sees the loop is
working.
