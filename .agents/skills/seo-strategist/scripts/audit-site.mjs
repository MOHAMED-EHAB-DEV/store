#!/usr/bin/env node
/**
 * audit-site.mjs
 *
 * Crawls the target site's homepage (and optionally extra paths) and runs
 * Google PageSpeed Insights (mobile + desktop) against it.
 *
 * Usage:
 *   node audit-site.mjs <target-url> [extra-path-1] [extra-path-2] ...
 *   e.g. node audit-site.mjs https://mhd-store.vercel.app /templates /blog
 *
 * Output:
 *   ./.seo-audit/site-report.json  (relative to current working directory)
 *
 * Optional env var:
 *   GOOGLE_PSI_API_KEY  — raises the PageSpeed Insights quota. Works without it
 *                         at low volume (a handful of calls per run).
 */

import fs from "node:fs";
import path from "node:path";
import { auditUrl, fetchHtml, parseSeoSignals } from "./lib/scrape.mjs";

const [targetUrl, ...extraPaths] = process.argv.slice(2);

if (!targetUrl) {
  console.error("Usage: node audit-site.mjs <target-url> [extra-path ...]");
  process.exit(1);
}

function normalize(url) {
  try {
    return new URL(url).toString();
  } catch {
    console.error(`Not a valid URL: ${url}`);
    process.exit(1);
  }
}

const homepage = normalize(targetUrl);

console.log(`Auditing ${homepage} (mobile + desktop PageSpeed, this can take 20-40s)...`);
const homepageAudit = await auditUrl(homepage, { includeDesktop: true });

if (!homepageAudit.ok) {
  console.error(`Failed to fetch homepage: ${homepageAudit.error}`);
}

const extraAudits = [];
for (const p of extraPaths) {
  const url = new URL(p, homepage).toString();
  console.log(`Auditing extra path: ${url} (mobile only)...`);
  const fetched = await fetchHtml(url);
  if (!fetched.ok || !fetched.html) {
    extraAudits.push({ url, ok: false, error: fetched.error || `HTTP ${fetched.status}` });
    continue;
  }
  const onPage = parseSeoSignals(fetched.html, url);
  extraAudits.push({ url, ok: true, onPage });
}

const report = {
  generatedAt: new Date().toISOString(),
  target: homepage,
  homepage: homepageAudit,
  extraPages: extraAudits,
};

const outDir = path.resolve(".seo-audit");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "site-report.json");
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

console.log("\n--- Summary ---");
if (homepageAudit.ok) {
  console.log(`Title: ${homepageAudit.onPage.title}`);
  console.log(`Meta description length: ${homepageAudit.onPage.metaDescriptionLength}`);
  console.log(`H1 count: ${homepageAudit.onPage.h1Count}`);
  console.log(`Structured data blocks: ${homepageAudit.onPage.structuredData.blockCount}`);
  console.log(`robots.txt found: ${homepageAudit.siteFiles.robotsExists}`);
  console.log(`sitemap.xml found: ${homepageAudit.siteFiles.sitemapExists}`);
  const mobile = homepageAudit.pageSpeed.mobile;
  if (mobile?.ok) {
    console.log(`PSI mobile scores: performance=${mobile.scores.performance}, seo=${mobile.scores.seo}, best-practices=${mobile.scores["best-practices"]}`);
  } else {
    console.log(`PSI mobile: unavailable (${mobile?.error || "unknown error"}) — continuing without it, note this as a gap in the final report.`);
  }
  const desktop = homepageAudit.pageSpeed.desktop;
  if (desktop?.ok) {
    console.log(`PSI desktop scores: performance=${desktop.scores.performance}, seo=${desktop.scores.seo}, best-practices=${desktop.scores["best-practices"]}`);
  }
} else {
  console.log(`Could not audit homepage: ${homepageAudit.error}`);
}
console.log(`\nWritten: ${path.relative(process.cwd(), outFile)}`);
