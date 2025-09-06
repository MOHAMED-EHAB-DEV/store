import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import shiki from "shiki";

/**
 * Server-side Markdown -> HTML with shiki highlighting and a rehype plugin
 * that adds classes/attributes so the rendered HTML matches your previous
 * React component styles/behaviour.
 */

let cachedHighlighter: shiki.Highlighter | null = null;
async function getHighlighter() {
  if (cachedHighlighter) return cachedHighlighter;
  cachedHighlighter = await shiki?.getHighlighter({ theme: "github-dark" });
  return cachedHighlighter;
}

/**
 * remark plugin that highlights code blocks with Shiki (replaces code nodes
 * with an HTML node containing the highlighted <pre><code>...</code></pre>).
 */
function remarkShiki() {
  return async (tree: Root) => {
    try {
      const highlighter = await getHighlighter();
      if (!highlighter) return;

      visit(tree, "code", (node: any) => {
        const lang = node.lang ?? "text";
        const code = node.value ?? "";
        try {
          const highlighted = highlighter.codeToHtml(code, { lang });
          node.type = "html";
          node.value = highlighted;
          delete node.lang;
          delete node.meta;
        } catch (err) {
          console.error("Shiki highlight error for a code block:", err);
        }
      });
    } catch (err) {
      console.error("Shiki error initializing highlighter:", err);
    }
  };
}

/**
 * rehype plugin to add classes/attributes to elements (h1,h2,h3,p,a,ul,ol,li,blockquote,inline code)
 * We run it after remarkRehype & rehypeSlug (so headings have ids).
 */
function rehypeAddClasses() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (!node.tagName) return;
      node.properties = node.properties || {};

      const addClass = (c: string) => {
        const existing = node.properties.className || [];
        // ensure className is array
        node.properties.className = Array.isArray(existing)
          ? [...existing, ...c.split(" ")]
          : [String(existing), ...c.split(" ")];
      };

      switch (node.tagName) {
        case "h1":
          addClass("text-xl md:text-3xl font-bold my-5");
          break;
        case "h2":
          addClass("text-lg md:text-2xl font-semibold my-4");
          break;
        case "h3":
          addClass("text-md md:text-xl font-semibold my-3");
          break;
        case "p":
          addClass("leading-relaxed mb-4");
          break;
        case "a":
          // open external links in new tab and add classes
          node.properties.target = "_blank";
          node.properties.rel = "noopener noreferrer";
          addClass("hover:text-blue-400 hover:underline");
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
          addClass("border-l-4 border-blue-500 pl-4 italic my-4");
          break;
        case "code":
          // Distinguish inline code (when parent is a paragraph) vs Shiki's <pre> output which is HTML already
          // For inline code you'll get a <code> element not inside a pre
          // Add a small inline style class for inline code
          addClass(
            "inline-code bg-gray-800 text-pink-400 px-1.5 py-0.5 rounded text-sm"
          );
          break;
        default:
          break;
      }
    });
  };
}

export async function mdToHtmlAndHeadings(content: string) {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkShiki)
      .use(remarkRehype, { allowDangerousHtml: true })
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

    return { html: String(file), headings };
  } catch (err) {
    console.error("mdToHtmlAndHeadings error:", err);
    return { html: "", headings: [] };
  }
}
