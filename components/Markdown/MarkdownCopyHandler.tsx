"use client";

import { useEffect } from "react";

export default function MarkdownCopyHandler() {
  useEffect(() => {
    function getCodeText(button: HTMLButtonElement) {
      const wrapper = button.closest(".code-block-wrapper");
      if (!wrapper) return "";
      const codeEl = wrapper.querySelector("pre code");
      return codeEl ? (codeEl as HTMLElement).innerText : "";
    }

    async function handleCopy(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const button = target.closest(".copy-btn") as HTMLButtonElement | null;
      if (!button) return;

      const code = getCodeText(button);
      const copyIcon = button.querySelector(".copy-icon") as HTMLElement | null;
      const copiedIcon = button.querySelector(
        ".copied-icon",
      ) as HTMLElement | null;

      const setSuccess = (on: boolean) => {
        button.classList.toggle("success", on);
        copyIcon?.classList.toggle("hidden", on);
        copiedIcon?.classList.toggle("hidden", !on);
      };

      try {
        // clipboard API might require secure context (HTTPS)
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(code);
        } else {
          throw new Error("Clipboard API unavailable");
        }
      } catch (_) {
        // Fallback for non-secure contexts or older browsers
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed", err);
        }
        document.body.removeChild(ta);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }

    document.addEventListener("click", handleCopy);
    return () => document.removeEventListener("click", handleCopy);
  }, []);

  return null;
}
