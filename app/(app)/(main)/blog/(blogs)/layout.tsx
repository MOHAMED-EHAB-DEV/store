import type { ReactNode } from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateStaticParams() {
  try {
    const response = await fetch(`${APP_URL}/api/blogs?limit=100`);

    if (!response.ok) return [];

    const data = await response.json();
    const blogs = data.success ? data.data : [];

    return blogs.map((blog: any) => ({
      id: blog._id.toString(),
    }));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error generating blog static params:", error);
    return [];
  }
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
