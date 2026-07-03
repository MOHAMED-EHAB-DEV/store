# SEO & Performance Plan — MHD Store

> **Living document.** Do not regenerate wholesale — diff against existing content and append a changelog entry on each re-run.

---

## 1. Executive Summary

MHD Store is a premium web-template marketplace built on Next.js 16 (App Router) with MongoDB, Cloudinary, and a custom proxy-based middleware (`proxy.ts`). The public surface — homepage, `/templates`, `/templates/[id]`, `/blog`, `/blog/[id]`, `/faqs`, `/support` — is mostly well-structured: ISR is used for template and blog detail pages, `generateStaticParams` pre-builds known slugs directly from the DB, structured data (Product, FAQPage, Organization, WebSite, Person) is present, and `next/font` (local WOFF2) is correctly wired. The foundation is solid but several high-impact gaps remain.

The most urgent issues are: (1) the homepage has **no `generateMetadata`** of its own — it inherits the root layout metadata verbatim, meaning every crawler sees the same title/description for `/` and all other un-overridden routes; (2) the OG image points to an SVG logo (`/assets/Icons/Logo.svg`) rather than a real 1200×630 bitmap — social previews will be blank or broken on most platforms; (3) `dashboard/support/page.tsx` is a top-level `"use client"` page that fetches data inside `useEffect`, making it fully client-rendered with a waterfall and zero server-side caching; (4) there is **no real-user monitoring** capturing Core Web Vitals, but a custom Web Vitals tracking model will be built to link with existing visitor/analytics models and surfaced in the admin dashboard. These four items are the priority stack before any polish work.

---

## 2. Route Inventory

| File Path | URL Pattern | Type | Rendering | metadata / generateMetadata | In Sitemap | Robots |
|---|---|---|---|---|---|---|
| `app/(app)/layout.tsx` | — | ROOT LAYOUT | Server | Static metadata (site-wide defaults) | — | index,follow |
| `app/(app)/(main)/page.tsx` | `/` | PUBLIC / MARKETING | Server Component, dynamic | ❌ None — inherits root defaults | ✅ priority 1.0 | — |
| `app/(app)/(main)/templates/page.tsx` | `/templates` | PUBLIC / MARKETING | Server, dynamic (searchParams, ISR 5h) | ✅ generateMetadata (category/tech variants) | ✅ priority 0.9 | — |
| `app/(app)/(main)/templates/(templates)/[id]/page.tsx` | `/templates/[id]` | PUBLIC / MARKETING | Static + ISR 1 week (generateStaticParams in layout) | ✅ generateMetadata + Product JSON-LD | ✅ priority 0.8 | — |
| `app/(app)/(main)/blog/page.tsx` | `/blog` | PUBLIC / MARKETING | Server, ISR 7d | ✅ generateMetadata | ✅ priority 0.8 | — |
| `app/(app)/(main)/blog/(blogs)/[id]/page.tsx` | `/blog/[slug-or-id]` | PUBLIC / MARKETING | Static + ISR 7d (generateStaticParams by slug) | ✅ generateMetadata + Article OG | ✅ priority 0.7 | — |
| `app/(app)/(main)/support/page.tsx` | `/support` | PUBLIC / MARKETING | Server Component (static) | ✅ Static metadata | ✅ priority 0.7 | — |
| `app/(app)/(main)/faqs/page.tsx` | `/faqs` | PUBLIC / MARKETING | Server, ISR 24h | ✅ Static metadata + FAQPage JSON-LD | ✅ priority 0.6 | — |
| `app/(app)/(main)/pricing/page.tsx` | `/pricing` | PUBLIC / MARKETING | Server Component (client child Pricing) | ❌ No metadata | ❌ Not in sitemap | — |
| `app/(app)/(main)/privacy-policy/page.tsx` | `/privacy-policy` | PUBLIC / MARKETING | Server Component (static) | ❌ No metadata | ❌ Not in sitemap | — |
| `app/(app)/(main)/terms-of-service/page.tsx` | `/terms-of-service` | PUBLIC / MARKETING | Server Component (static) | ❌ No metadata | ❌ Not in sitemap | — |
| `app/(app)/(auth)/login/page.tsx` | `/login` | AUTH-GATED APP | Server (auth layout redirects if logged in) | ❌ No metadata | ❌ | Allowed in robots.ts |
| `app/(app)/(auth)/register/page.tsx` | `/register` | AUTH-GATED APP | Server | ❌ No metadata | ❌ | Allowed in robots.ts |
| `app/(app)/(user)/favorites/page.tsx` | `/favorites` | AUTH-GATED APP | Server (auth layout) | ❌ No metadata, no noindex | ❌ | NOT disallowed (bug) |
| `app/(app)/(dashboard)/dashboard/page.tsx` | `/dashboard` | AUTH-GATED APP | Server (auth layout) | ✅ Static metadata | ❌ | ✅ Disallowed |
| `app/(app)/(dashboard)/dashboard/purchased-templates/page.tsx` | `/dashboard/purchased-templates` | AUTH-GATED APP | Server | ✅ Static metadata | ❌ | ✅ Disallowed |
| `app/(app)/(dashboard)/dashboard/settings/page.tsx` | `/dashboard/settings` | AUTH-GATED APP | Server | ✅ Static metadata | ❌ | ✅ Disallowed |
| `app/(app)/(dashboard)/dashboard/support/page.tsx` | `/dashboard/support` | AUTH-GATED APP | "use client" top-level — full CSR | ❌ No metadata | ❌ | ✅ Disallowed |
| `app/(app)/(dashboard)/dashboard/support/[id]/page.tsx` | `/dashboard/support/[id]` | AUTH-GATED APP | Server shell + client detail | ❌ No metadata | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/page.tsx` | `/admin` | ADMIN / DASHBOARD | Server, force-dynamic | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/analytics/page.tsx` | `/admin/analytics` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/blogs/**` | `/admin/blogs`, `…/new`, `…/edit/[id]` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/templates/**` | `/admin/templates`, `…/new`, `…/edit/[id]` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/categories/**` | `/admin/categories`, `…/new`, `…/edit/[id]` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/users/**` | `/admin/users`, `…/[id]` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/faqs/**` | `/admin/faqs`, `…/new`, `…/edit/[id]` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/support/**` | `/admin/support`, `…/tickets`, `…/[id]` | ADMIN / DASHBOARD | Server + "use client" (tickets list) | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/download-logs/page.tsx` | `/admin/download-logs` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/error-logs/page.tsx` | `/admin/error-logs` | ADMIN / DASHBOARD | Server | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/(app)/(admin)/admin/refresh/page.tsx` | `/admin/refresh` | ADMIN / DASHBOARD | "use client" | ✅ noindex,nofollow | ❌ | ✅ Disallowed |
| `app/banned/page.tsx` | `/banned` | UTILITY | Server | ✅ noindex,nofollow | ❌ | — |
| `app/not-found.tsx` | (404) | UTILITY | "use client" (mouse tracking) | ❌ No metadata | — | — |
| `app/global-error.tsx` | (500) | UTILITY | "use client" | ❌ No metadata | — | — |
| `app/robots.ts` | `/robots.txt` | UTILITY | Static generated | — | — | — |
| `app/sitemap.ts` | `/sitemap.xml` | UTILITY | ISR 48h | — | — | — |
| `app/mhd/images/[src]/route.ts` | `/mhd/images/[src]` | API / ROUTE HANDLER | Dynamic (custom image proxy) | — | — | — |
| `app/api/template/[id]/route.ts` | `/api/template/[id]` | API | Dynamic | — | — | — |
| `app/api/template/featured/route.ts` | `/api/template/featured` | API | Dynamic | — | — | — |
| `app/api/template/search/route.ts` | `/api/template/search` | API | Dynamic | — | — | — |
| `app/api/blogs/route.ts` | `/api/blogs` | API | Dynamic | — | — | — |
| `app/api/blogs/[id]/route.ts` | `/api/blogs/[id]` | API | Dynamic | — | — | — |
| `app/api/faqs/route.ts` | `/api/faqs` | API | Dynamic | — | — | — |
| `app/api/analytics/track/route.ts` | `/api/analytics/track` | API | Dynamic | — | — | — |
| `app/api/error-log/route.ts` | `/api/error-log` | API | Dynamic | — | — | — |
| `app/api/admin/**` | `/api/admin/*` | API (admin) | Dynamic | — | — | — |
| `app/api/user/**` | `/api/user/*` | API (user) | Dynamic | — | — | — |
| `app/api/support/**` | `/api/support/*` | API | Dynamic | — | — | — |

---

## 3. Findings by Page Type

### 3A. Public / Marketing Routes

#### `/` — Homepage

| Check | Status | Detail |
|---|---|---|
| Title (50-60 chars) | ⚠️ INHERITED | Falls through to root layout: "Mohammed Ehab - Premium Templates Store \| Modern Web Templates" — 65 chars, over limit |
| Description (150-160 chars) | ⚠️ INHERITED | Root layout description, 193 chars — over limit |
| alternates.canonical | ⚠️ INHERITED | Root layout sets `canonical: "https://mhd-store.vercel.app"` — technically correct but not page-owned |
| OG image | ❌ BROKEN | Points to `/assets/Icons/Logo.svg` — SVGs are rejected by Facebook, LinkedIn, Slack. Width/height declared 1200×630 but it is a vector |
| Twitter card | ⚠️ | Same SVG issue |
| JSON-LD | ✅ Partial | Organization, WebSite, Person schemas injected via layout. No ItemList for the template catalog |
| h1 | ❌ MULTIPLE | Hero.tsx:67, WhyUS.tsx:10, FramerFeatures.tsx:155,179,202,238 — at least 6 h1 elements on one page |
| next/image | ✅ | next/image used; no raw img tags in app pages |
| next/font | ✅ | localFont with Roboto + Parastoo WOFF2. No CDN font links |
| Sitemap | ✅ | Present, priority 1.0 |
| Client boundary | ⚠️ | GlobalStoreInitializer in root Providers eagerly imports GSAP, ScrollTrigger, TextPlugin, SplitText on every page |

#### `/templates` — Template Listing

| Check | Status | Detail |
|---|---|---|
| Title | ✅ | Dynamically generated per category/tech filter |
| Description | ✅ | Dynamic, within range |
| alternates.canonical | ⚠️ CANONICAL COLLISION | Always set to `/templates` regardless of ?categories= or ?builtWith= params (line 39), while generateMetadata generates unique titles for filtered URLs — titles and canonical disagree |
| OG image | ❌ MISSING | No `images` in the OpenGraph block (lines 41-52) |
| Twitter card | ⚠️ | summary_large_image declared but no images field |
| JSON-LD | ❌ MISSING | No structured data. An ItemList schema would unlock product carousel eligibility |
| h1 | ✅ | Single h1 "Templates" at line 107 |
| Sitemap | ✅ | Present |

#### `/templates/[id]` — Template Detail

| Check | Status | Detail |
|---|---|---|
| Title | ✅ | `${template.title} \| Premium Templates` — dynamic |
| Description | ⚠️ | substring(0,160) can cut mid-word. Falls back to generic string if undefined |
| alternates.canonical | ✅ | Set to `${APP_URL}/templates/${id}` — consistent with sitemap |
| OG type | ⚠️ | Set to "website" (line 115) — should be "product" for product pages |
| OG image | ✅ | Uses template.thumbnail (Cloudinary) with declared 1200x630 |
| JSON-LD | ✅ Mostly | Product schema with Offer, AggregateRating wired from real data |
| BreadcrumbList | ❌ MISSING | BreadcrumbSchema component exists in components/SEO/StructuredData.tsx:139 but is unused here |
| ISR | ✅ | revalidate: 604800 (1 week) + cache tags |

#### `/blog` — Blog Listing

| Check | Status | Detail |
|---|---|---|
| Title | ✅ | "Blog \| Insights & Updates" — 22 chars (could be more keyword-rich) |
| Description | ✅ | 115 chars |
| alternates.canonical | ✅ | Correct |
| OG image | ❌ MISSING | No images in OG block |
| JSON-LD | ❌ MISSING | No schema. CollectionPage or Blog schema appropriate |
| next/image unoptimized | ✅ | Blog cover images use `unoptimized` (line 88) — intentionally bypassing Next.js default optimization to rely on the custom `/mhd/images/[src]` image proxy and Cloudinary |
| priority on LCP | ✅ | Featured card sets priority={featured} — first card gets priority={true} |
| h1 | ✅ | Single h1 at line 147 |

#### `/blog/[id]` — Blog Detail

| Check | Status | Detail |
|---|---|---|
| Title | ✅ | `${blog.title} \| Blog` |
| Description | ⚠️ | `blog.excerpt \|\| blog.content?.substring(0,160)` — raw markdown may leak # ** []() syntax into meta description |
| alternates.canonical | ✅ | Uses blog.slug \|\| id |
| OG type | ✅ | "article" with publishedTime |
| next/image unoptimized | ✅ | Three instances (lines 137, 204). Same as listing — uses custom image proxy |
| JSON-LD | ❌ MISSING | No Article schema — concrete ranking signal for Discover eligibility |
| Markdown SEO | ❌ MISSING | Markdown renderer (`lib/markdown.ts`) omits SEO attributes (`aria-label`, `title`, `loading="lazy"`) for links and images |
| h1 | ✅ | Single h1 at line 150 |
| Read time | ⚠️ | Hard-coded "5 min read" (line 161) — not calculated from actual content |
| countViews in ISR fetch | ❌ | getData fetches ?countViews=true at ISR revalidation time, not on user visits — view counts are meaningless and may slow revalidation if DB write is slow |
| ISR | ✅ | revalidate: 604800 (7d) + cache tag |

#### `/support`

| Check | Status | Detail |
|---|---|---|
| Title | ❌ WRONG BRAND | "Contact Support \| My Store" — should say "MHD Store" (line 9) |
| Description | ✅ | 95 chars |
| alternates.canonical | ❌ MISSING | Not set |
| OG | ❌ MISSING | No OG block |
| Twitter | ❌ MISSING | No Twitter block |
| JSON-LD | ❌ MISSING | ContactPage schema appropriate |
| h1 | ✅ | Present (line 48) |

#### `/faqs`

| Check | Status | Detail |
|---|---|---|
| Title | ✅ | 48 chars |
| Description | ✅ | 136 chars |
| alternates.canonical | ❌ MISSING | Not set |
| OG image | ❌ MISSING | No images in OG block |
| JSON-LD | ✅ | FAQPage schema wired from live DB data |
| h1 | ✅ | In FAQHero.tsx (line 13) |

#### `/pricing`

| Check | Status | Detail |
|---|---|---|
| Title | ❌ MISSING | No metadata export at all (11-line file) |
| Description | ❌ | None |
| Canonical | ❌ | None |
| JSON-LD | ❌ | No schema — Offer or SoftwareApplication would be appropriate |
| Sitemap | ❌ | Not in sitemap |

#### `/privacy-policy` and `/terms-of-service`

| Check | Status | Detail |
|---|---|---|
| Title | ❌ MISSING | No metadata on either page |
| Description | ❌ | None |
| Canonical | ❌ | None |
| Sitemap | ❌ | Neither page in sitemap |
| Content | ⚠️ | Skeleton-level content (~100 words each) — thin content risk |

---

### 3B. Auth-Gated App Routes

**`/login` and `/register`**
- No metadata on either page — title inherits root layout, appearing as duplicates of the homepage in SERPs.
- Allowed by `robots.ts` (intentional) but without their own branded titles.

**`/favorites`**
- Route group `(user)` with auth redirect in layout.tsx — correct.
- `/user/` is disallowed in `robots.ts` but the actual URL is `/favorites`, not `/user/favorites` — the disallow rule does NOT apply.
- `proxy.ts` line 51: `protectedRoutes = ["/dashboard", "/favourites"]` — British spelling typo. The actual route is `/favorites`. Middleware auth redirect therefore does NOT apply to `/favorites` either.
- No `robots: { index: false, follow: false }` metadata on the page.
- Result: `/favorites` is publicly crawlable, not middleware-protected from unauthenticated users, and has no noindex. This is a P0 privacy and indexability bug.

**`/dashboard`, `/dashboard/purchased-templates`, `/dashboard/settings`**
- Auth enforced at layout level. Disallowed in `robots.ts` via `/dashboard/`. Correct.
- No page-level `robots: { index: false, follow: false }` — relying solely on robots.txt.
- `dashboard/page.tsx` fetches `api/user/templates` and `api/user/tickets` without forwarding auth cookies (lines 14-15) — these server fetches fail silently in production, dashboard always shows empty on SSR.

**`/dashboard/support`**
- Top-level `"use client"` (line 1) — entire page is client-rendered.
- Data fetched in useEffect — classic CSR waterfall: HTML → JS → fetch → render.
- No caching on the ticket fetch, no streaming, no sub-route loading.tsx.

---

### 3C. Admin / Dashboard Routes

- All admin pages correctly set `robots: "noindex, nofollow"` ✅
- `robots.ts` disallows `/admin/` ✅
- `(admin)/layout.tsx` sets `force-dynamic` and server-validates role ✅
- `@visx/*` charting packages are in `optimizePackageImports` (next.config.ts lines 92-98) ✅
- Admin dashboard (`admin/page.tsx`) fetches up to 4x 1,000-record datasets simultaneously with no pagination (lines 34-38) — P2 performance concern.
- `admin/support/tickets/page.tsx` and `admin/refresh/page.tsx` are `"use client"` — acceptable for internal tools.

---

### 3D. API / Route Handler Routes

| Route | Caching | Notes |
|---|---|---|
| `GET /api/template/[id]` | ❌ Missing `options.cache` | Hot path for ISR pages — middleware wrapper is present but `{ cache: ... }` is not passed |
| `GET /api/template/featured` | ❌ Missing `options.cache` | Used by homepage on every render, but lacks `{ cache: ... }` option |
| `GET /api/template/search` | ✅ Cache-Control set | Correctly passes `{ cache: { ttl: 120000 } }` to middleware |
| `GET /api/blogs` | ❌ Missing `options.cache` | Middleware is present but missing the cache option |
| `GET /api/faqs` | ❌ Missing `options.cache` | 24h ISR at page level, but API response carries no hint |
| `POST /api/analytics/track` | ✅ N/A | Write, correct |
| `GET /api/template/download` | ✅ no-store | Correct for signed download links |
| `withAPIMiddleware` helper | ✅ CAPABLE | Correctly emits `Cache-Control` headers for CDN caching when `options.cache` is provided. The infrastructure exists, it just needs to be turned on for hot paths |

---

### 3E. Utility Routes

| File | Status | Notes |
|---|---|---|
| `app/robots.ts` | ✅ Mostly | `/favorites` not disallowed (bug). `/login`+`/register` intentionally allowed but lack own titles |
| `app/sitemap.ts` | ✅ / ⚠️ | ISR 48h. All static pages use `new Date()` as lastModified — tells Google every static page changed right now on every revalidation |
| `app/not-found.tsx` | ⚠️ | "use client" required for animations — no metadata export. Next.js 13+ supports metadata on not-found |
| `app/global-error.tsx` | ⚠️ | "use client" — no metadata |
| `app/banned/page.tsx` | ✅ | noindex,nofollow set |
| `public/manifest.json` | ⚠️ | Icons are SVG (image/svg+xml) — PWA spec requires PNG for installable icons on Android/Chrome |

---

## 4. Prioritized Action List

### P0 — Breaks indexing or functionality

| # | Finding | File(s) | Effort | Impact |
|---|---|---|---|---|
| P0-1 | ~~OG/Twitter image is an SVG — social crawlers reject it; LinkedIn/Facebook/Slack previews are blank~~ **FIXED** | `app/(app)/layout.tsx:49,63` | S | CTR, social sharing |
| P0-2 | ~~Homepage has no generateMetadata — title 65 chars (over limit), inherited across all un-overridden routes~~ **FIXED** | `app/(app)/(main)/page.tsx` | S | Indexability, CTR |
| P0-3 | ~~`/favorites` not blocked — proxy typo (`/favourites`), no robots.txt disallow, no page-level noindex~~ **FIXED** | `proxy.ts:51`, `(user)/favorites/page.tsx`, `robots.ts` | S | Indexability, privacy |
| P0-4 | ~~`/pricing`, `/privacy-policy`, `/terms-of-service` have zero metadata — crawlers see inherited brand title as duplicates~~ **FIXED** | Three page files | S | Indexability, duplicate content |
| P0-5 | ~~`/pricing`, `/privacy-policy`, `/terms-of-service` missing from sitemap~~ **FIXED** | `app/sitemap.ts` | S | Crawl coverage |

### P1 — Real ranking or performance impact

| # | Finding | File(s) | Effort | Impact |
|---|---|---|---|---|
| P1-2 | ~~`/blog/[id]` missing Article JSON-LD — no schema for rich results/Discover~~ **FIXED** | `blog/(blogs)/[id]/page.tsx` | S | SERP rich results |
| P1-3 | ~~Multiple h1 on homepage — 6+ h1 across Hero, WhyUS, FramerFeatures~~ **FIXED** | `home/FramerFeatures.tsx:155,179,202,238`, `WhyUS.tsx:10`, `Hero.tsx:67` | M | Heading hierarchy, ranking signals |
| P1-4 | ~~`/dashboard/support` is full CSR — useEffect waterfall, no SSR, no caching~~ **FIXED** | `dashboard/support/page.tsx` | M | INP, TTI, retention |
| P1-5 | ~~No real-user monitoring — build custom Analytics model for page load scores linked to Visitors, with admin dashboard view~~ **FIXED** | Entire project | M | LCP, INP, CLS visibility |
| P1-6 | ~~GlobalStoreInitializer eagerly imports GSAP on every page including admin/dashboard~~ **FIXED** | `components/shared/GlobalStoreInitializer.tsx:9-12` | M | INP, TTI, bundle size |
| P1-7 | ~~Hot-path API routes are missing the `cache` configuration for `withAPIMiddleware`~~ **FIXED** | `api/template/featured`, `api/blogs`, `api/faqs` | XS | TTFB, LCP |
| P1-8 | ~~`/templates` OG has no image — social shares of the most important marketing page show blank~~ **FIXED** | `templates/page.tsx:41-52` | S | CTR from social |
| P1-9 | ~~`/support` title says "My Store" — wrong brand name in SERP~~ **FIXED** | `support/page.tsx:9` | XS | CTR, brand trust |
| P1-10 | ~~`/templates` canonical collision — unique titles for filter URLs but canonical always `/templates`~~ **FIXED** | `templates/page.tsx:38-39` | M | Crawl budget, deduplication |
| P1-11 | ~~`/templates/[id]` OG type is "website" not "product"~~ **FIXED** | `templates/[id]/page.tsx:115` | XS | Social rich previews |
| P1-12 | ~~BreadcrumbList JSON-LD missing on template detail — component exists but unused~~ **FIXED** | `templates/[id]/page.tsx`, `components/SEO/StructuredData.tsx:139` | S | Rich results, SERP appearance |
| P1-13 | ~~`/faqs` missing canonical and OG image~~ **FIXED** | `faqs/page.tsx` | S | Indexability, social CTR |
| P1-14 | ~~`/support` missing canonical, OG, and Twitter blocks~~ **FIXED** | `support/page.tsx` | S | Indexability, social CTR |
| P1-15 | ~~Dashboard server fetches omit auth cookies — returns empty data, users see blank dashboard on SSR~~ **FIXED** | `dashboard/page.tsx:14-15` | M | User retention, INP |

| P1-17 | ~~Dashboard pages lack page-level `robots: { index: false, follow: false }`~~ **FIXED** | `dashboard/*/page.tsx` | S | Indexability, defense-in-depth |
| P1-18 | ~~Blog description may contain raw markdown syntax in meta description~~ **FIXED** | `blog/[id]/page.tsx:83,107` | S | CTR, SERP appearance |
| P1-19 | ~~Markdown renderer omits SEO/Accessibility attributes (no `title`/`aria-label` on links, no `loading="lazy"` on images)~~ **FIXED** | `lib/markdown.ts:380-425` | M | WCAG compliance, on-page SEO |

### P2 — Polish

| # | Finding | File(s) | Effort | Impact |
|---|---|---|---|---|
| P2-1 | ~~Sitemap static pages use `new Date()` as lastModified — misleads crawlers~~ **FIXED** | `sitemap.ts:45,52,58,64,69` | XS | Crawl efficiency |
| P2-2 | ~~Blog read time hard-coded to "5 min" regardless of content length~~ **FIXED** | `blog/[id]/page.tsx:161` | S | UX trust |
| P2-3 | ~~`/login` and `/register` lack branded titles~~ **FIXED** | auth pages | S | SERP CTR |
| P2-4 | ~~`manifest.json` icons are SVG — not installable as PWA on Android/Chrome~~ **FIXED** | `public/manifest.json` | S | PWA install |
| P2-5 | ~~`not-found.tsx` has no metadata~~ **FIXED** | `app/not-found.tsx` | XS | Indexability |
| P2-6 | ~~`global-error.tsx` has no metadata~~ **FIXED** | `app/global-error.tsx` | XS | Indexability |
| P2-7 | ~~Admin analytics dashboard fetches 4× 1,000-record datasets with no pagination~~ **FIXED** | `admin/page.tsx:34-38` | M | Server load, INP |
| P2-8 | ~~TemplateSchema (CreativeWork) component defined but unused — confusion risk~~ **FIXED** | `components/SEO/StructuredData.tsx:69` | XS | Code hygiene |
| P2-9 | ~~`/templates/[id]` title suffix "Premium Templates" gives no brand signal~~ **FIXED** | `templates/[id]/page.tsx:98` | XS | CTR |
| P2-10 | ~~`/blog` title keyword-thin — no mention of topic domain~~ **FIXED** | `blog/page.tsx:25` | XS | CTR, relevance |

---

## 5. AI Insights & Opinions

> All items in this section are labeled **Opinion:** — these are strategic assessments grounded in what was actually found in the code, not generic advice.

---

**Opinion: The MongoDB `_id`-based URL for templates is a ranking handicap worth addressing soon.**

Template detail pages are at `/templates/6847abc...` (MongoDB ObjectId). Google handles alphanumeric IDs fine, but they carry zero keyword signal. A competitor selling "React SaaS Dashboard Template" at `/templates/react-saas-dashboard` will outrank an identical page at `/templates/6847abc123`. The `generateStaticParams` already queries the DB — adding a `slug` field to the Template model and migrating URLs (with 301 redirects from old IDs) is a one-time M-effort task with long-term compounding ranking value. The sitemap also uses `_id` URLs — switching to slugs improves crawl utility further.

---

**Opinion: The homepage's heading hierarchy is likely the biggest on-page SEO problem right now.**

The homepage ships with 6+ `<h1>` elements across `Hero.tsx`, `WhyUS.tsx`, and `FramerFeatures.tsx`. Google has downgraded the ranking signal of `<h1>` for pages that abuse the tag. The fix is simple: make only `Hero.tsx:67` a true `<h1>`; downgrade all other section titles to `<h2>` or `<h3>`. Zero visual impact — CSS classes don't change. Measurable improvement in semantic structure.

---

**Opinion: The GlobalStoreInitializer's GSAP import is a hidden performance tax on every non-homepage route.**

GSAP + ScrollTrigger + TextPlugin + SplitText are registered at module-level in `GlobalStoreInitializer.tsx` lines 9-16. This component lives in the root layout `Providers`, so every page — `/admin/users`, `/dashboard/settings`, `/blog/[id]` — loads GSAP. GSAP is not small (~120KB minified). Move `gsap.registerPlugin` inside a dynamic import keyed to the homepage route, or split `GlobalStoreInitializer` into a base initializer (user state, socket, analytics) and a separate `HomeAnimationsInitializer` mounted only on public marketing pages.

---

**Opinion: An ItemList schema on `/templates` could unlock Google Shopping carousel eligibility.**

The templates listing page has no structured data. An `ItemList` schema with each template as a `ListItem` → `Product` (price, name, URL) makes the page eligible for Google's product rich results. This is a genuine traffic multiplier for marketplaces. The data is already fetched server-side (`initialData`) so the schema can be generated with zero additional API calls.

---

**Opinion: `countViews=true` in the blog detail ISR fetch is a silent footgun.**

`getData` in `blog/[id]/page.tsx` line 37 fetches `?countViews=true`. Since this is an ISR page, the fetch runs at build time and revalidation time — not on actual user visits. View counts increment on every ISR cycle, not on reads. Worse: if the DB write is slow under load, it directly delays ISR revalidation and increases TTFB. Fix: fire view count client-side on mount (same pattern as the analytics tracker in `GlobalStoreInitializer`) and remove it from the server fetch.

---

**Opinion: Building a bespoke Real-User Monitoring (RUM) model is a powerful upgrade.**

You currently have zero production visibility into LCP, INP, or CLS for real users. Given that `GlobalStoreInitializer` fires three `fetch` calls on mount (user, favorites, purchased-templates) before the app is interactive, INP is likely elevated for logged-in users — but this is invisible without RUM. Instead of relying on third-party tools like Vercel Speed Insights, building a custom Analytics model to capture every page load score (via `useReportWebVitals`) and linking it to your existing visitor and analytics models is the ideal path forward. We can surface this data in the admin panel with a list of visits and overall average statistics, giving you complete, owned visibility over Core Web Vitals. *Crucially, to ensure the monitoring itself doesn't degrade performance, the network requests transmitting these scores will be deferred until after the page load completes (utilizing `requestIdleCallback`), keeping the critical rendering path clear.*

---

**Opinion: The `/favorites` privacy vulnerability is the one issue that needs fixing before any SEO work.**

`/favorites` is auth-protected at the layout level, but: (1) `proxy.ts` has a British-spelling typo (`/favourites`) so middleware auth protection does not apply; (2) `/favorites` is not in `robots.txt` disallow; (3) there is no `noindex` metadata. A crawler or shared link could expose the URL. Even with a redirect-on-render, Google sometimes indexes the pre-redirect state. Fix all three layers: correct the typo in `proxy.ts:51`, add `/favorites` to `robots.ts` disallow, and add `robots: { index: false, follow: false }` to the page metadata.

---

**Opinion: `/templates/[category]` static routes would have outsized SEO return.**

Filtered templates at `/templates?categories=saas` cannot be statically generated, cannot carry unique canonical URLs cleanly, and don't rank for categorical queries. Creating static routes like `/templates/saas`, `/templates/react`, `/templates/nextjs` would: enable `generateStaticParams` per category, give Google clean categorical pages, and match high-intent queries like "Next.js templates for sale". The categories already exist in the DB and are fetched via `getCategories()` — this is M-effort with long-term compounding return.

---

**Opinion: The sitemap's self-fetch pattern has a cold-start ordering risk.**

`sitemap.ts` fetches `${baseUrl}/api/template` and `${baseUrl}/api/blogs?limit=100` (lines 8, 24). During cold deployment, the sitemap revalidation may run before API routes are warmed, causing fetches to fail and the sitemap to serve only static pages. Consider fetching directly from the DB in `sitemap.ts` (as `generateStaticParams` does in the layout files) rather than through the HTTP API. This removes the self-referential network dependency and is more reliable under Vercel's build/revalidation ordering.

---

**Opinion: The duplicate schema components create a maintenance trap.**

`components/SEO/StructuredData.tsx` exports `TemplateSchema` emitting `@type: "CreativeWork"` (line 99). The actual template detail page emits `@type: "Product"` via inline `<script>` (lines 153-187). If a future developer adds `<TemplateSchema>` thinking they're adding structured data, Google sees two conflicting schema types for the same entity. Either delete `TemplateSchema` from the component file or update it to `Product` and replace the inline JSON-LD with the component.

---

## 6. Changelog

| Date | Summary |
|---|---|
| 2026-07-03 | **Initial audit.** First complete route inventory. 5 P0 issues, 18 P1 issues, 10 P2 issues identified. No prior entries — this is the baseline. Notable: proxy.ts confirmed as the Next.js 16 middleware entry point; no root middleware.ts. |
| 2026-07-03 | **Audit Update.** User clarified that `unoptimized` image flag is intentional because a custom image proxy handles compression. Removed `unoptimized` from the P1 list. |
| 2026-07-03 | **Audit Update.** User clarified strategy for Real-User Monitoring: plan updated to propose a custom Analytics model for page load scores, linked to visitor data and surfaced in the admin dashboard. |
| 2026-07-03 | **Audit Update.** Added performance caveat to RUM implementation: metric transmission must be deferred post-load via `requestIdleCallback` or delayed `useEffect`. |
| 2026-07-03 | **Audit Update.** Added finding P1-19 regarding missing SEO/Accessibility attributes (`aria-label`, `title`, `loading="lazy"`) in the custom markdown renderer. |
| 2026-07-03 | **Audit Update.** Verified `withAPIMiddleware` correctly sets CDN `Cache-Control` headers. Updated plan to reflect that hot-path API routes are simply missing the `options.cache` parameter, rather than it being an infrastructure flaw. Removed P1-16. |
