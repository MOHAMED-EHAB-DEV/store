# Keyword & Content Strategy Framework

Goal: turn what you actually found (site copy, competitor copy, business model
inferred from the codebase/site) into a prioritized, defensible plan — not a
generic list of keywords nobody asked for.

## Step 1 — Infer the business model and funnel from evidence, not assumption
Read the scraped homepage/page copy and the codebase (pricing pages, checkout
flow, service/contact pages, README). Identify:
- What's sold (product, service, both — e.g. a "freemium to service" model
  where a free/cheap product is the top of funnel and custom work is the
  monetization engine)
- Who it's for (developers? agencies? end businesses?)
- What the buying decision actually depends on (price, trust/credibility,
  technical proof, speed)

## Step 2 — Bucket keyword targets by funnel stage
For each bucket, ground every suggestion in something you actually saw
(a competitor ranking/targeting it, a gap in the site's own content, a
question implied by the product but not yet answered on the site).

- **TOFU (awareness)** — broad, high-volume, educational. e.g. "next.js seo
  guide", "how to improve core web vitals in next.js". These build authority
  and internal-linking opportunities but rarely convert directly.
- **MOFU (consideration)** — comparison / evaluation intent. e.g. "best
  next.js template marketplace", "[competitor] alternative", "next.js
  template vs custom build". These are where competitor benchmarking data is
  most useful — if a competitor ranks here and the target site doesn't, that's
  a named gap.
- **BOFU (decision/transactional)** — near-purchase intent, tied directly to
  what's sold. e.g. "custom next.js development service", "[specific
  template type] template". These should map to actual product/service pages,
  not just blog posts.

## Step 3 — Score and prioritize (don't just list, rank)
For each candidate keyword/content idea, note:
- **Relevance** (1-3): how directly it maps to what the business actually sells
- **Competitive gap** (1-3): 3 = no competitor covers this well, 1 = all
  competitors already own it hard
- **Funnel value** (1-3): BOFU generally scores higher than TOFU for a small
  site that needs revenue, not just traffic — but TOFU pieces that funnel into
  a strong internal link to a BOFU page can score high too if you can name
  that internal link explicitly

Sort the final list by relevance × gap × funnel value, highest first, and only
present the top tier as "prioritized" — don't dump every keyword you thought
of into one flat list.

## Step 4 — Content plan: go beyond "write a blog post"
For each prioritized target, propose the *right format*, not just an article:
- **Comparison/alternative pages** ("[Competitor] alternative", "X vs Y")
  when the gap analysis shows competitors owning comparison SERPs
- **Programmatic pages** when there's a repeatable pattern in the product
  catalog (e.g. one page per template category, one per use-case/industry)
  that a static blog post can't scale to
- **Interactive tools/calculators** relevant to the niche (e.g. a "template
  cost calculator", a "Core Web Vitals checker") — these earn backlinks and
  differentiate from competitors who only publish text
- **Technical tutorials grounded in real work already done** (this is a
  legitimate SEO play when the person doing the writing is also the developer
  — it's both a ranking asset and a portfolio/credibility signal for the
  service side of the funnel)
- Plain blog posts, when that's genuinely the best format — don't force
  novelty where a straightforward how-to is what the query deserves

Always name 2-3 ideas per run that aren't the obvious "write more blog
content" — a comparison page, a piece of interactive content, or a
programmatic-SEO angle specific to what this site's catalog/data actually
supports.

## Step 5 — 30-60-90 roadmap
Group the combined technical fixes + content plan into:
- **0-30 days**: critical technical fixes + quick wins + 1-2 highest-priority
  content pieces
- **31-60 days**: important technical fixes + next tier of content
- **61-90 days**: remaining opportunities + measurement checkpoint (what to
  check in Search Console / analytics to see if it's working)
