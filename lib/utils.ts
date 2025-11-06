import { ICategory, ITemplate } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstChar(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

export function formatCount(count: number): string {
    if (count < 1000) return count.toString();
    if (count < 1_000_000) return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "K";
    if (count < 1_000_000_000) return (count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1) + "M";
    return (count / 1_000_000_000).toFixed(count % 1_000_000_000 === 0 ? 0 : 1) + "B";
}

export function sanitizeFilename(title?: string, fallback = "download.zip") {
    if (!title || typeof title !== "string") return fallback;
    let cleaned = title.replace(/[\x00-\x1f\x7f]/g, "");            // remove control
    cleaned = cleaned.replace(/[\/\\]+/g, "-").replace(/["<>|?*:]+/g, "").trim();
    cleaned = cleaned.replace(/\s+/g, "-");
    if (cleaned.length > 60) cleaned = cleaned.slice(0, 60);
    return `${cleaned}.zip`;
}