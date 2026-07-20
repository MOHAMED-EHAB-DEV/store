import type { ReactNode } from "react";
import { ICategory } from "@/lib/validations/category";
import { getCategories } from "@/static/categories";

export async function generateStaticParams() {
  try {
    const categories = (await getCategories()) as ICategory[];
    return categories.map((cat) => ({
      category: cat.slug,
    }));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error generating category static params:", error);
    return [];
  }
}

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
