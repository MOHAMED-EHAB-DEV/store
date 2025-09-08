import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { marked } from "marked";

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

export const serializeTemplate = (doc: ITemplate) => ({
    ...doc,
    _id: `${doc._id}`,
    author: `${doc.author}`,
    categories: doc.categories?.map((id: any) => `${id}`),
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
});

export const serializeCategory = (doc: ICategory) => ({
    ...doc,
    _id: `${doc._id}`,
    parent: doc.parent ? `${doc.parent}` : null,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
});

export function formatCount(count: number): string {
    if (count < 1000) return count.toString();
    if (count < 1_000_000) return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "K";
    if (count < 1_000_000_000) return (count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1) + "M";
    return (count / 1_000_000_000).toFixed(count % 1_000_000_000 === 0 ? 0 : 1) + "B";
}