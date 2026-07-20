#!/usr/bin/env node
/**
 * analyze-competitors.mjs
 *
 * Runs the same on-page audit (and a lighter, mobile-only PageSpeed check)
 * against each competitor URL, then computes a quick comparison summary.
 *
 * Usage:
 *   node analyze-competitors.mjs <competitor-url-1> <competitor-url-2> ...
 *
 * Output:
 *   ./.seo-audit/competitor-report.json
 */

import fs from "node:fs";
import path from "node:path";
import { auditUrl } from "./lib/scrape.mjs";

const competitorUrls = process.argv.slice(2);

if (competitorUrls.length === 0) {
  console.error("Usage: node analyze-competitors.mjs <competitor-url-1> [competitor-url-2 ...]");
  process.exit(1);
}

const results = [];
for (const raw of competitorUrls) {
  let url;
  try {
    url = new URL(raw).toString();
  } catch {
    results.push({ url: raw, ok: false, error: "invalid URL" });
    continue;
  }
  console.log(`Auditing competitor: ${url} ...`);
  const audit = await auditUrl(url, { includeDesktop: false });
  results.push(audit);
}

const successful = results.filter((r) => r.ok);

function avg(nums) {
  const filtered = nums.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (filtered.length === 0) return null;
  return Math.round(filtered.reduce((a, b) => a + b, 0) / filtered.length);
}

const comparisonSummary = {
  competitorsAudited: successful.length,
  competitorsFailed: results.length - successful.length,
  avgWordCount: avg(successful.map((r) => r.onPage.wordCount)),
  avgH1Count: avg(successful.map((r) => r.onPage.h1Count)),
  pctWithStructuredData: successful.length
    ? Math.round((successful.filter((r) => r.onPage.structuredData.blockCount > 0).length / successful.length) * 100)
    : null,
  pctWithOpenGraph: successful.length
    ? Math.round((successful.filter((r) => r.onPage.openGraph.present).length / successful.length) * 100)
    : null,
  avgMobilePerformanceScore: avg(successful.map((r) => r.pageSpeed?.mobile?.scores?.performance).filter(Boolean)),
  avgMobileSeoScore: avg(successful.map((r) => r.pageSpeed?.mobile?.scores?.seo).filter(Boolean)),
};

const report = {
  generatedAt: new Date().toISOString(),
  competitors: results,
  comparisonSummary,
};

const outDir = path.resolve(".seo-audit");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "competitor-report.json");
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

console.log("\n--- Comparison summary ---");
console.log(JSON.stringify(comparisonSummary, null, 2));
console.log(`\nWritten: ${path.relative(process.cwd(), outFile)}`);
