"use server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import { createHighlighter } from "shiki";
import rehypeRaw from "rehype-raw";

/**
 * Server-side Markdown -> HTML with shiki highlighting and copy button functionality
 *
 * Notes:
 * - Multiple Shiki themes are registered. The `themeMap` controls which theme is used per language.
 * - We post-process the Shiki HTML to ensure it receives Tailwind-friendly classes so the background/copy button etc. look right.
 * - Client copy script appended to HTML is robust (runs immediately and on DOMContentLoaded).
 */

/* ----------------------------- Shiki Highlighter ---------------------------- */
let cachedHighlighter: any = (globalThis as any).shikiHighlighter || null;

export async function createHighlighterSafe() {
  // guard: don't run in browser
  if (typeof window !== "undefined") {
    console.warn("[shiki] skipping: running in browser.");
    return null;
  }

  // guard for Edge runtime (Shiki doesn't run in Edge)
  if (typeof process !== "undefined" && process?.env?.NEXT_RUNTIME === "edge") {
    console.warn(
      "[shiki] skipping: detected Edge runtime (NEXT_RUNTIME=edge).",
    );
    return null;
  }

  if ((globalThis as any).shikiHighlighter) {
    cachedHighlighter = (globalThis as any).shikiHighlighter;
    return cachedHighlighter;
  }

  if (cachedHighlighter) return cachedHighlighter;

  try {
    cachedHighlighter = await createHighlighter({
      // Use only bundled theme names (or replace material-default -> material-theme)
      themes: [
        "github-dark",
        "github-light",
        "nord",
        "dracula",
        "material-theme",
        "monokai",
        "min-dark",
        "min-light",
        "dark-plus",
      ],
      langs: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "markdown",
        "bash",
        "shell",
        "css",
        "html",
        "python",
        "yaml",
        "toml",
        "dockerfile",
        "php",
        "go",
        "c",
        "cpp",
      ],
    });

    (globalThis as any).shikiHighlighter = cachedHighlighter;
    return cachedHighlighter;
  } catch (err) {
    // log full error so you can diagnose missing theme or other issues
    console.error("[shiki] failed to initialize:", err);
    return null;
  }
}

/* Example helper to pick theme per language (customize to taste) */
function pickThemeForLang(lang: string | null) {
  const l = (lang || "text").toLowerCase();
  const themeMap: Record<string, string> = {
    ts: "github-dark",
    tsx: "github-dark",
    js: "dracula",
    jsx: "dracula",
    python: "nord",
    bash: "github-light",
    shell: "github-light",
    json: "material-theme",
    html: "monokai",
    css: "material-theme",
    php: "monokai",
    go: "nord",
    c: "nord",
    cpp: "nord",
    dockerfile: "github-dark",
    toml: "material-theme",
    yaml: "material-theme",
    markdown: "github-light",
  };
  return themeMap[l] || "github-dark";
}

/* --------------------------- remark plugin fixes --------------------------- */

// Convert inline code nodes that contain newlines into code blocks before rehype conversion.
function remarkMultilineCodeFix() {
  return (tree: any) => {
    visit(tree, "inlineCode", (node, index, parent) => {
      if (node.value && node.value.includes("\n")) {
        const codeBlockNode = {
          type: "code",
          lang: null,
          value: node.value,
        };
        if (parent && typeof index === "number") {
          parent.children[index] = codeBlockNode;
        }
      }
    });
  };
}

/* ------------------------------ rehype shiki ------------------------------- */

/**
 * Rehype plugin that highlights code blocks, wraps them with UI for copy and badges,
 * and ensures the Shiki HTML gets a consistent background class.
 */
function rehypeShiki() {
  return async (tree: any) => {
    const highlighter = await createHighlighterSafe();
    if (!highlighter) {
      console.warn("Shiki unavailable — using fallback code blocks.");
      return; // or continue but ensure you create fallback blocks later
    }

    const codeBlocks: any[] = [];

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "pre" && node.children?.[0]?.tagName === "code") {
        codeBlocks.push({ node, index, parent, type: "pre-code" });
      } else if (
        node.tagName === "code" &&
        node.children?.[0]?.value?.includes("\n")
      ) {
        codeBlocks.push({ node, index, parent, type: "multiline-code" });
      }
    });

    for (const { node, index, parent, type } of codeBlocks) {
      let lang: string | null = null;
      let code = "";

      if (type === "pre-code") {
        const codeNode = node.children[0];
        lang =
          codeNode.properties?.className?.[0]?.replace("language-", "") ||
          codeNode.properties?.className
            ?.find((c: string) => c.startsWith("language-"))
            ?.replace("language-", "") ||
          "text";
        code = codeNode.children?.[0]?.value || "";
      } else {
        lang =
          node.properties?.className
            ?.find((cls: string) => cls.startsWith("language-"))
            ?.replace("language-", "") || "text";
        code = node.children?.[0]?.value || "";

        // Simple heuristics to detect language if none specified
        if (!lang || lang === "text") {
          if (
            code.includes("import ") &&
            (code.includes("from ") || code.includes("export "))
          ) {
            lang = "js";
          } else if (
            /\bdef\b/.test(code) ||
            (code.includes("import ") && code.includes("python"))
          ) {
            lang = "python";
          } else if (code.includes("<?php")) {
            lang = "php";
          } else if (code.includes("<div") || code.includes("<html")) {
            lang = "html";
          } else if (code.includes("{") && /[#.]([A-Za-z0-9_-]+)/.test(code)) {
            lang = "css";
          } else if (
            code.includes("/app") ||
            code.includes("/components") ||
            code.match(/\.(ts|js|tsx|jsx)\b/)
          ) {
            lang = "bash";
          } else {
            lang = "text";
          }
        }
      }

      if (!code.trim()) continue;

      try {
        const theme = pickThemeForLang(lang);
        // Generate highlighted HTML using Shiki
        let highlightedHtml = highlighter.codeToHtml(code, {
          lang,
          theme,
        });

        // Post-process: inject our classes into Shiki's existing class attribute
        // and strip the inline style so our CSS variables control colors.
        // Shiki outputs: <pre class="shiki github-dark" style="background-color:...">
        // We merge "shiki-pre" into that class and remove the style attr.
        highlightedHtml = highlightedHtml
          // 1. Inject shiki-pre into the existing class attribute on <pre>
          .replace(
            /<pre([^>]*?)class="([^"]*?)"([^>]*)>/i,
            `<pre$1class="$2 shiki-pre"$3>`,
          )
          // 2. Strip inline style from <pre> so CSS vars (--code-bg/fg) take over
          .replace(/<pre([^>]*?)\sstyle="[^"]*"([^>]*)>/i, `<pre$1$2>`);

        // Create wrapper with copy button and language badge
        const wrappedCodeBlock = {
          type: "element",
          tagName: "div",
          properties: {
            className: [
              "code-block-wrapper",
              "relative",
              "group",
              "my-6",
              // ensure the wrapper doesn't inherit weird typographic styles
              // "not-prose",
            ],
            "data-lang": lang,
            "data-theme": theme,
          },
          children: [
            // Copy button — all visual styles defined in .copy-btn CSS rule
            {
              type: "element",
              tagName: "button",
              properties: {
                className: ["copy-btn"],
                type: "button",
                "aria-label": "Copy code to clipboard",
              },
              children: [
                {
                  type: "element",
                  tagName: "span",
                  properties: { className: ["copy-icon"] },
                  children: [
                    {
                      type: "raw",
                      value: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
                    },
                  ],
                },
                {
                  type: "element",
                  tagName: "span",
                  properties: { className: ["copied-icon", "hidden"] },
                  children: [
                    {
                      type: "raw",
                      value: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 15 2 2 4-4"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
                    },
                  ],
                },
              ],
            },
            lang !== "text"
              ? {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["lang-badge"] },
                  children: [{ type: "text", value: lang?.toUpperCase() }],
                }
              : null,
            {
              type: "raw",
              value: highlightedHtml,
            },
          ].filter(Boolean),
        };

        if (parent && typeof index === "number") {
          parent.children[index] = wrappedCodeBlock;
        }
      } catch (error) {
        console.warn(
          `Failed to highlight code block with language "${lang}":`,
          error,
        );
        // Fallback styled block
        const fallbackCodeBlock = {
          type: "element",
          tagName: "div",
          properties: {
            className: ["code-block-wrapper", "relative", "group", "my-6"],
          },
          children: [
            {
              type: "element",
              tagName: "pre",
              properties: {
                className: [
                  "bg-gray-900",
                  "rounded-lg",
                  "p-4",
                  "overflow-x-auto",
                  "text-sm",
                  "font-mono",
                  "text-gray-100",
                ],
              },
              children: [
                {
                  type: "element",
                  tagName: "code",
                  children: [{ type: "text", value: code }],
                },
              ],
            },
          ],
        };

        if (parent && typeof index === "number") {
          parent.children[index] = fallbackCodeBlock;
        }
      }
    } // end for
  };
}

/* ---------------------------- rehype add classes --------------------------- */

function rehypeAddClasses() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (!node.tagName) return;
      node.properties = node.properties || {};

      const addClass = (c: string) => {
        const existing = node.properties.className || [];
        node.properties.className = Array.isArray(existing)
          ? [...existing, ...c.split(" ")]
          : [String(existing), ...c.split(" ")];
      };

      switch (node.tagName) {
        case "h1":
          addClass("text-2xl md:text-4xl font-bold my-6 leading-tight");
          break;
        case "h2":
          addClass("text-xl md:text-3xl font-semibold my-5 leading-snug");
          break;
        case "h3":
          addClass("text-lg md:text-2xl font-semibold my-4 leading-snug");
          break;
        case "p":
          addClass("leading-relaxed mb-6 text-base md:text-lg");
          break;
        case "a":
          node.properties.target = "_blank";
          node.properties.rel = "noopener noreferrer";
          
          // Extract text content for better accessibility tags
          const textNode = (node.children || []).find((c: any) => c.type === "text");
          const linkText = textNode ? textNode.value : (node.properties.href || "link");
          
          if (!node.properties.title) node.properties.title = `Visit ${linkText}`;
          if (!node.properties["aria-label"]) node.properties["aria-label"] = `Link to ${linkText}`;

          addClass(
            "text-purple-400 hover:text-purple-300 hover:underline transition-colors duration-200",
          );
          break;
        case "img":
          if (!node.properties.loading) node.properties.loading = "lazy";
          if (!node.properties.alt) node.properties.alt = "Blog Image";
          addClass("rounded-lg shadow-lg my-6 mx-auto max-w-full border border-gray-800");
          break;
        case "ul":
          addClass("list-disc pl-6 mb-4 space-y-2");
          break;
        case "ol":
          addClass("list-decimal pl-6 mb-4 space-y-2");
          break;
        case "li":
          addClass("leading-relaxed");
          break;
        case "blockquote":
          addClass(
            "border-l-4 border-purple-500 pl-4 italic my-4 bg-purple-900/20 rounded-r-lg py-2",
          );
          break;
        case "code":
          // Only apply inline code styles if it's truly inline (short, single line)
          const codeContent = node.children?.[0]?.value || "";
          if (!codeContent.includes("\n") && codeContent.length < 100) {
            addClass(
              "bg-gray-800 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono",
            );
          }
          break;
        case "table":
          addClass(
            "w-full border-collapse border border-gray-700 rounded-lg overflow-hidden my-6",
          );
          break;
        case "th":
          addClass(
            "border border-gray-700 px-4 py-2 bg-gray-800 font-semibold text-left",
          );
          break;
        case "td":
          addClass("border border-gray-700 px-4 py-2");
          break;
        default:
          break;
      }
    });
  };
}

/* ----------------------------- export function ---------------------------- */

export async function mdToHtmlAndHeadings(content: string) {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMultilineCodeFix)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw) // handle inline raw HTML inside MD
      .use(rehypeShiki) // highlight + wrap
      .use(rehypeSlug)
      .use(rehypeAddClasses)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(content);

    const headingMatches = [...content?.matchAll(/^(#{1,6})\s+(.*)$/gm)];
    const headings = headingMatches.map((m) => {
      const level = m[1].length;
      const text = m[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      return { level, text, id };
    });

    return {
      html: String(file),
      headings,
    };
  } catch (err) {
    console.error("mdToHtmlAndHeadings error:", err);
    return { html: "", headings: [] };
  }
}
