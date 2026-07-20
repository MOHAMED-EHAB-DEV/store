#!/usr/bin/env node
/**
 * scan-codebase.mjs
 *
 * Zero-dependency static scanner for Next.js technical SEO signals.
 * Walks the project, inspects routing (App Router or Pages Router),
 * metadata coverage, sitemap/robots setup, next.config, image/font
 * optimization usage, structured data, and client-bundle risk patterns.
 *
 * Usage:
 *   node scan-codebase.mjs <project-root>
 *
 * Output:
 *   <project-root>/.seo-audit/codebase-report.json
 */

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.argv[2] || ".");

if (!fs.existsSync(projectRoot)) {
  console.error(`Project root not found: ${projectRoot}`);
  process.exit(1);
}

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "dist",
  "build",
  "out",
  ".turbo",
  "coverage",
]);

const CODE_EXT = new Set([".tsx", ".ts", ".jsx", ".js"]);

/** Recursively walk a directory, yielding file paths. */
function walk(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function readSafe(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// 1. Locate app root (App Router) and/or pages root (Pages Router)
// ---------------------------------------------------------------------------
const candidateAppDirs = ["app", "src/app"].map((p) => path.join(projectRoot, p));
const candidatePagesDirs = ["pages", "src/pages"].map((p) => path.join(projectRoot, p));

const appDir = candidateAppDirs.find((p) => fs.existsSync(p)) || null;
const pagesDir = candidatePagesDirs.find((p) => fs.existsSync(p)) || null;

const routerType = appDir && pagesDir ? "hybrid" : appDir ? "app" : pagesDir ? "pages" : "unknown";

const allFiles = walk(projectRoot);
const codeFiles = allFiles.filter((f) => CODE_EXT.has(path.extname(f)));

// ---------------------------------------------------------------------------
// 2. Metadata coverage (App Router)
// ---------------------------------------------------------------------------
const metadataRegex = /export\s+(const\s+metadata|async\s+function\s+generateMetadata|function\s+generateMetadata)/;
const dynamicMetadataRegex = /export\s+async\s+function\s+generateMetadata/;
const canonicalRegex = /alternates\s*:\s*{[^}]*canonical/s;
const ogRegex = /openGraph\s*:/;
const twitterRegex = /twitter\s*:/;

function findLayoutChainMetadata(pageFile) {
  // Walk up from the page's directory to appDir, checking each layout.* file.
  let dir = path.dirname(pageFile);
  const chain = [];
  while (dir.startsWith(appDir)) {
    const layoutCandidates = ["layout.tsx", "layout.ts", "layout.jsx", "layout.js"].map((f) =>
      path.join(dir, f)
    );
    const layoutFile = layoutCandidates.find((f) => fs.existsSync(f));
    if (layoutFile) {
      const content = readSafe(layoutFile);
      if (metadataRegex.test(content)) {
        chain.push({ file: path.relative(projectRoot, layoutFile), dynamic: dynamicMetadataRegex.test(content) });
      }
    }
    if (dir === appDir) break;
    dir = path.dirname(dir);
  }
  return chain;
}

const routes = [];
if (appDir) {
  const pageFiles = codeFiles.filter((f) => {
    const base = path.basename(f);
    return /^page\.(tsx|ts|jsx|js)$/.test(base) && f.startsWith(appDir);
  });

  for (const pageFile of pageFiles) {
    const content = readSafe(pageFile);
    const ownMetadata = metadataRegex.test(content);
    const ownDynamic = dynamicMetadataRegex.test(content);
    const inheritedChain = findLayoutChainMetadata(pageFile);
    const hasCanonical = canonicalRegex.test(content) || inheritedChain.length > 0 && false;
    const hasOg = ogRegex.test(content);
    const hasTwitter = twitterRegex.test(content);

    routes.push({
      route: path.relative(projectRoot, pageFile),
      isApiRoute: false,
      ownMetadata,
      ownMetadataIsDynamic: ownDynamic,
      inheritedFrom: inheritedChain.map((c) => c.file),
      hasMetadataSomewhere: ownMetadata || inheritedChain.length > 0,
      hasCanonicalOnPage: hasCanonical,
      hasOpenGraphOnPage: hasOg,
      hasTwitterCardOnPage: hasTwitter,
      isDynamicRoute: /\[.+\]/.test(pageFile),
    });
  }
}

// Pages Router: check for next/head usage or next-seo as a coarse proxy
const pagesRouterFindings = [];
if (pagesDir) {
  const pageFiles = codeFiles.filter(
    (f) =>
      f.startsWith(pagesDir) &&
      !path.basename(f).startsWith("_") &&
      !f.includes(`${path.sep}api${path.sep}`)
  );
  for (const pageFile of pageFiles) {
    const content = readSafe(pageFile);
    pagesRouterFindings.push({
      route: path.relative(projectRoot, pageFile),
      usesNextHead: /from\s+["']next\/head["']/.test(content),
      usesNextSeo: /from\s+["']next-seo["']/.test(content),
      isDynamicRoute: /\[.+\]/.test(pageFile),
    });
  }
}

// ---------------------------------------------------------------------------
// 3. Sitemap & robots
// ---------------------------------------------------------------------------
const sitemapCandidates = [
  ["app/sitemap.ts", "app router — programmatic"],
  ["app/sitemap.js", "app router — programmatic"],
  ["src/app/sitemap.ts", "app router — programmatic"],
  ["public/sitemap.xml", "static file"],
  ["next-sitemap.config.js", "next-sitemap package"],
  ["next-sitemap.config.ts", "next-sitemap package"],
].map(([p, method]) => ({ file: path.join(projectRoot, p), method }));

const sitemap = sitemapCandidates.find((c) => fs.existsSync(c.file));

const robotsCandidates = [
  ["app/robots.ts", "app router — programmatic"],
  ["app/robots.js", "app router — programmatic"],
  ["src/app/robots.ts", "app router — programmatic"],
  ["public/robots.txt", "static file"],
].map(([p, method]) => ({ file: path.join(projectRoot, p), method }));

const robots = robotsCandidates.find((c) => fs.existsSync(c.file));

// ---------------------------------------------------------------------------
// 4. next.config.*
// ---------------------------------------------------------------------------
const nextConfigFile = ["next.config.js", "next.config.mjs", "next.config.ts"]
  .map((f) => path.join(projectRoot, f))
  .find((f) => fs.existsSync(f));

let nextConfig = {
  exists: Boolean(nextConfigFile),
  file: nextConfigFile ? path.relative(projectRoot, nextConfigFile) : null,
  hasImagesConfig: false,
  hasHeadersFn: false,
  hasRedirectsFn: false,
  hasCompress: false,
};

if (nextConfigFile) {
  const content = readSafe(nextConfigFile);
  nextConfig.hasImagesConfig = /images\s*:\s*{/.test(content);
  nextConfig.hasHeadersFn = /async\s+headers\s*\(/.test(content);
  nextConfig.hasRedirectsFn = /async\s+redirects\s*\(/.test(content);
  nextConfig.hasCompress = /compress\s*:\s*true/.test(content);
}

// ---------------------------------------------------------------------------
// 5. Image optimization usage
// ---------------------------------------------------------------------------
let nextImageUsageCount = 0;
let rawImgTagCount = 0;
const filesWithMissingAlt = [];

const rawImgRegex = /<img\b[^>]*>/gi;
const nextImageImportRegex = /from\s+["']next\/image["']/;
const jsxImageTagRegex = /<Image\b[^>]*>/g;

for (const file of codeFiles) {
  const content = readSafe(file);
  if (nextImageImportRegex.test(content)) {
    const matches = content.match(jsxImageTagRegex) || [];
    nextImageUsageCount += matches.length;
    for (const tag of matches) {
      if (!/\balt\s*=/.test(tag)) {
        filesWithMissingAlt.push({ file: path.relative(projectRoot, file), tag: "Image", snippet: tag.slice(0, 80) });
      }
    }
  }
  const rawMatches = content.match(rawImgRegex) || [];
  rawImgTagCount += rawMatches.length;
  for (const tag of rawMatches) {
    if (!/\balt\s*=/.test(tag)) {
      filesWithMissingAlt.push({ file: path.relative(projectRoot, file), tag: "img", snippet: tag.slice(0, 80) });
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Font optimization
// ---------------------------------------------------------------------------
let usesNextFont = false;
let externalFontLinkFiles = [];
const nextFontRegex = /from\s+["']next\/font\//;
const externalFontRegex = /fonts\.googleapis\.com/;

for (const file of codeFiles) {
  const content = readSafe(file);
  if (nextFontRegex.test(content)) usesNextFont = true;
  if (externalFontRegex.test(content)) {
    externalFontLinkFiles.push(path.relative(projectRoot, file));
  }
}
// also check global CSS files
const cssFiles = allFiles.filter((f) => [".css", ".scss"].includes(path.extname(f)));
for (const file of cssFiles) {
  const content = readSafe(file);
  if (externalFontRegex.test(content)) externalFontLinkFiles.push(path.relative(projectRoot, file));
}

// ---------------------------------------------------------------------------
// 7. Structured data (JSON-LD)
// ---------------------------------------------------------------------------
let jsonLdFileCount = 0;
const jsonLdFiles = [];
const jsonLdRegex = /application\/ld\+json/;
for (const file of codeFiles) {
  const content = readSafe(file);
  if (jsonLdRegex.test(content)) {
    jsonLdFileCount++;
    jsonLdFiles.push(path.relative(projectRoot, file));
  }
}

// ---------------------------------------------------------------------------
// 8. Client bundle risk patterns
// ---------------------------------------------------------------------------
const LARGE_FILE_LINE_THRESHOLD = 300;
let useClientFileCount = 0;
const largeClientFiles = [];
const useClientRegex = /^["']use client["'];?\s*$/m;

for (const file of codeFiles) {
  const content = readSafe(file);
  if (useClientRegex.test(content.split("\n").slice(0, 3).join("\n")) || /^\s*["']use client["']/.test(content)) {
    useClientFileCount++;
    const lineCount = content.split("\n").length;
    if (lineCount > LARGE_FILE_LINE_THRESHOLD) {
      largeClientFiles.push({ file: path.relative(projectRoot, file), lines: lineCount });
    }
  }
}

// Barrel / heavy icon imports — common bundle-bloat source
const iconImportFlags = [];
const reactIconsTopLevelRegex = /from\s+["']react-icons["']/;
const lucideNamedImportRegex = /import\s*{([^}]{0,600})}\s*from\s+["']lucide-react["']/g;

for (const file of codeFiles) {
  const content = readSafe(file);
  if (reactIconsTopLevelRegex.test(content)) {
    iconImportFlags.push({
      file: path.relative(projectRoot, file),
      issue: "imports from 'react-icons' root instead of a subpath (e.g. 'react-icons/fa') — pulls in the whole icon set",
    });
  }
  let m;
  while ((m = lucideNamedImportRegex.exec(content)) !== null) {
    const names = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    if (names.length > 8) {
      iconImportFlags.push({
        file: path.relative(projectRoot, file),
        issue: `imports ${names.length} icons from a single 'lucide-react' statement — check tree-shaking is actually working in the build output`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Assemble report
// ---------------------------------------------------------------------------
const report = {
  generatedAt: new Date().toISOString(),
  projectRoot,
  routerType,
  appRouter: appDir
    ? {
        routeCount: routes.length,
        routesMissingMetadata: routes.filter((r) => !r.hasMetadataSomewhere).map((r) => r.route),
        routesWithOwnDynamicMetadata: routes.filter((r) => r.ownMetadataIsDynamic).map((r) => r.route),
        dynamicRoutesMissingMetadata: routes
          .filter((r) => r.isDynamicRoute && !r.hasMetadataSomewhere)
          .map((r) => r.route),
        routesMissingOpenGraph: routes.filter((r) => !r.hasOpenGraphOnPage).map((r) => r.route),
        routes,
      }
    : null,
  pagesRouter: pagesDir
    ? {
        routeCount: pagesRouterFindings.length,
        routesWithoutNextHeadOrSeo: pagesRouterFindings
          .filter((r) => !r.usesNextHead && !r.usesNextSeo)
          .map((r) => r.route),
        routes: pagesRouterFindings,
      }
    : null,
  sitemap: {
    exists: Boolean(sitemap),
    method: sitemap ? sitemap.method : null,
    file: sitemap ? path.relative(projectRoot, sitemap.file) : null,
  },
  robots: {
    exists: Boolean(robots),
    method: robots ? robots.method : null,
    file: robots ? path.relative(projectRoot, robots.file) : null,
  },
  nextConfig,
  images: {
    nextImageTagCount: nextImageUsageCount,
    rawImgTagCount,
    missingAltCount: filesWithMissingAlt.length,
    missingAltSamples: filesWithMissingAlt.slice(0, 25),
  },
  fonts: {
    usesNextFont,
    externalGoogleFontLinkFiles: [...new Set(externalFontLinkFiles)],
  },
  structuredData: {
    filesWithJsonLd: jsonLdFileCount,
    files: jsonLdFiles,
  },
  clientBundleRisk: {
    useClientFileCount,
    largeClientFiles: largeClientFiles.sort((a, b) => b.lines - a.lines).slice(0, 20),
    iconImportFlags,
  },
  totals: {
    codeFilesScanned: codeFiles.length,
  },
};

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------
const outDir = path.join(projectRoot, ".seo-audit");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "codebase-report.json");
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

console.log(`Router type: ${routerType}`);
if (appDir) {
  console.log(`App Router routes scanned: ${routes.length}`);
  console.log(`Routes missing metadata anywhere in the chain: ${report.appRouter.routesMissingMetadata.length}`);
}
if (pagesDir) {
  console.log(`Pages Router routes scanned: ${pagesRouterFindings.length}`);
}
console.log(`Sitemap: ${report.sitemap.exists ? report.sitemap.method : "NOT FOUND"}`);
console.log(`Robots: ${report.robots.exists ? report.robots.method : "NOT FOUND"}`);
console.log(`Images missing alt: ${report.images.missingAltCount}`);
console.log(`Structured data (JSON-LD) found in ${jsonLdFileCount} file(s)`);
console.log(`Large 'use client' files (>${LARGE_FILE_LINE_THRESHOLD} lines): ${largeClientFiles.length}`);
console.log(`Icon import flags: ${iconImportFlags.length}`);
console.log(`\nWritten: ${path.relative(process.cwd(), outFile)}`);
