import type { ReactNode } from "react";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";

export async function generateStaticParams() {
  try {
    await connectToDatabase();
    // Only generate pages for published blogs
    const blogs = await Blog.find({ isPublished: true }).select('slug').lean();

    return blogs.map((blog: any) => ({
      id: blog.slug.toString(),
    }));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error generating blog static params (DB query failed):", error);
    return [];
  }
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
