import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstChar(str: string) {
  if (!str) return "";
  if (str.toLowerCase() == "gsap") return str.toUpperCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

export function formatCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000)
    return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "K";
  if (count < 1_000_000_000)
    return (count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1) + "M";
  return (
    (count / 1_000_000_000).toFixed(count % 1_000_000_000 === 0 ? 0 : 1) + "B"
  );
}

export function sanitizeFilename(title?: string, fallback = "download.zip") {
  if (!title || typeof title !== "string") return fallback;
  let cleaned = title.replace(/[\x00-\x1f\x7f]/g, ""); // remove control
  cleaned = cleaned
    .replace(/[\/\\]+/g, "-")
    .replace(/["<>|?*:]+/g, "")
    .trim();
  cleaned = cleaned.replace(/\s+/g, "-");
  if (cleaned.length > 60) cleaned = cleaned.slice(0, 60);
  return `${cleaned}.zip`;
}

export function formatDate(
  date: string | Date | undefined,
  locale: string = "en-US",
): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function isLowHardware(): boolean {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;

  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory && nav.deviceMemory < 4) return true;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) return true;

  const isTouch = "ontouchstart" in window || nav.maxTouchPoints > 0;
  if (isTouch && window.innerWidth < 768) return true;

  return false;
}

