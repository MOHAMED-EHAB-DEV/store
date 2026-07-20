import * as cheerio from "cheerio";

const USER_AGENT = "Mozilla/5.0 (compatible; SEOStrategistAuditBot/1.0; +https://github.com/)";

/**
 * Fetch raw HTML for a URL with a timeout and a normal-looking UA.
 * Returns { ok, status, html, error }.
 */
export async function fetchHtml(url, { timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    const html = await res.text();
    return { ok: res.ok, status: res.status, html, error: null };
  } catch (err) {
    return { ok: false, status: null, html: null, error: err.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse core on-page SEO signals out of raw HTML using cheerio.
 */
export function parseSeoSignals(html, pageUrl) {
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr("content") || null;
  const canonical = $('link[rel="canonical"]').attr("href") || null;
  const robotsMeta = $('meta[name="robots"]').attr("content") || null;
  const viewport = $('meta[name="viewport"]').attr("content") || null;
  const lang = $("html").attr("lang") || null;

  const og = {
    title: $('meta[property="og:title"]').attr("content") || null,
    description: $('meta[property="og:description"]').attr("content") || null,
    image: $('meta[property="og:image"]').attr("content") || null,
    type: $('meta[property="og:type"]').attr("content") || null,
    url: $('meta[property="og:url"]').attr("content") || null,
  };
  const hasOg = Object.values(og).some(Boolean);

  const twitter = {
    card: $('meta[name="twitter:card"]').attr("content") || null,
    title: $('meta[name="twitter:title"]').attr("content") || null,
    description: $('meta[name="twitter:description"]').attr("content") || null,
    image: $('meta[name="twitter:image"]').attr("content") || null,
  };
  const hasTwitter = Object.values(twitter).some(Boolean);

  const headingOutline = {};
  for (let level = 1; level <= 6; level++) {
    headingOutline[`h${level}`] = $(`h${level}`).length;
  }
  const h1Texts = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  let imgCount = 0;
  let imgMissingAlt = 0;
  $("img").each((_, el) => {
    imgCount++;
    const alt = $(el).attr("alt");
    if (!alt || !alt.trim()) imgMissingAlt++;
  });

  let internalLinks = 0;
  let externalLinks = 0;
  let host = null;
  try {
    host = new URL(pageUrl).host;
  } catch {
    /* ignore */
  }
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const resolved = new URL(href, pageUrl);
      if (host && resolved.host === host) internalLinks++;
      else externalLinks++;
    } catch {
      /* relative or malformed, count as internal best-effort */
      internalLinks++;
    }
  });

  const jsonLdBlocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    try {
      const parsed = JSON.parse(raw);
      const types = Array.isArray(parsed)
        ? parsed.map((p) => p["@type"]).filter(Boolean)
        : [parsed["@type"]].filter(Boolean);
      jsonLdBlocks.push({ valid: true, types });
    } catch {
      jsonLdBlocks.push({ valid: false, types: [] });
    }
  });

  return {
    title,
    titleLength: title ? title.length : 0,
    metaDescription,
    metaDescriptionLength: metaDescription ? metaDescription.length : 0,
    canonical,
    robotsMeta,
    viewport,
    lang,
    openGraph: { present: hasOg, ...og },
    twitterCard: { present: hasTwitter, ...twitter },
    headingOutline,
    h1Count: headingOutline.h1,
    h1Texts,
    wordCount,
    images: { count: imgCount, missingAlt: imgMissingAlt },
    links: { internal: internalLinks, external: externalLinks },
    structuredData: {
      blockCount: jsonLdBlocks.length,
      validBlockCount: jsonLdBlocks.filter((b) => b.valid).length,
      types: [...new Set(jsonLdBlocks.flatMap((b) => b.types))],
    },
  };
}

/**
 * Check for robots.txt and sitemap.xml at the site origin.
 */
export async function checkRobotsAndSitemap(pageUrl) {
  let origin;
  try {
    origin = new URL(pageUrl).origin;
  } catch {
    return { robotsExists: false, sitemapExists: false, error: "invalid URL" };
  }

  const [robotsRes, sitemapRes] = await Promise.all([
    fetchHtml(`${origin}/robots.txt`, { timeoutMs: 8000 }),
    fetchHtml(`${origin}/sitemap.xml`, { timeoutMs: 8000 }),
  ]);

  return {
    robotsExists: Boolean(robotsRes.ok && robotsRes.html && robotsRes.html.length > 0),
    robotsMentionsSitemap: Boolean(robotsRes.html && /sitemap:/i.test(robotsRes.html)),
    sitemapExists: Boolean(sitemapRes.ok && sitemapRes.html && /<urlset|<sitemapindex/i.test(sitemapRes.html || "")),
    sitemapUrlCount: sitemapRes.html ? (sitemapRes.html.match(/<loc>/gi) || []).length : 0,
  };
}

/**
 * Call Google PageSpeed Insights v5 (Lighthouse-in-the-cloud, no local Chrome needed).
 * Works keyless at low volume; set GOOGLE_PSI_API_KEY for higher quota.
 */
export async function getPageSpeed(url, strategy = "mobile", categories = ["performance", "seo", "best-practices"]) {
  const apiKey = process.env.GOOGLE_PSI_API_KEY;
  const params = new URLSearchParams({ url, strategy });
  for (const c of categories) params.append("category", c);
  if (apiKey) params.set("key", apiKey);

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(endpoint, { signal: controller.signal });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `PSI HTTP ${res.status}`, detail: body.slice(0, 300) };
    }
    const data = await res.json();
    const lh = data.lighthouseResult;
    const scores = {};
    if (lh?.categories) {
      for (const [key, val] of Object.entries(lh.categories)) {
        scores[key] = Math.round((val.score ?? 0) * 100);
      }
    }

    const auditIds = [
      "largest-contentful-paint",
      "cumulative-layout-shift",
      "total-blocking-time",
      "first-contentful-paint",
      "interactive",
      "speed-index",
    ];
    const labMetrics = {};
    for (const id of auditIds) {
      const a = lh?.audits?.[id];
      if (a) labMetrics[id] = { value: a.numericValue, displayValue: a.displayValue };
    }

    // Real-user field data, when Google has enough traffic on the URL
    const fieldMetrics = {};
    const cwv = data.loadingExperience?.metrics;
    if (cwv) {
      for (const [key, val] of Object.entries(cwv)) {
        fieldMetrics[key] = { percentile: val.percentile, category: val.category };
      }
    }

    const opportunities = Object.values(lh?.audits || {})
      .filter((a) => a.details?.type === "opportunity" && (a.score ?? 1) < 0.9)
      .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
      .slice(0, 6)
      .map((a) => ({ id: a.id, title: a.title, displayValue: a.displayValue }));

    return { ok: true, strategy, scores, labMetrics, fieldMetrics, opportunities };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Full single-URL audit: HTML fetch + parse + robots/sitemap + PSI (mobile [+ desktop]).
 */
export async function auditUrl(url, { includeDesktop = false, includeJsonLd = true } = {}) {
  const fetched = await fetchHtml(url);
  if (!fetched.ok || !fetched.html) {
    return { url, ok: false, error: fetched.error || `HTTP ${fetched.status}` };
  }

  const onPage = parseSeoSignals(fetched.html, url);
  const [siteFiles, psiMobile, psiDesktop] = await Promise.all([
    checkRobotsAndSitemap(url),
    getPageSpeed(url, "mobile"),
    includeDesktop ? getPageSpeed(url, "desktop") : Promise.resolve(null),
  ]);

  return {
    url,
    ok: true,
    fetchedAt: new Date().toISOString(),
    onPage,
    siteFiles,
    pageSpeed: { mobile: psiMobile, desktop: psiDesktop },
  };
}
