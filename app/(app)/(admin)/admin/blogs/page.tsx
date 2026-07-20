import { Suspense } from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import AdminBlogsClient from "@/components/Admin/AdminBlogsClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";

export const metadata: Metadata = {
  title: "Blogs Management | Admin Dashboard",
  description: "Manage blog posts and content",
  robots: "noindex, nofollow",
};

async function getBlogs(searchParams: { [key: string]: string | undefined }) {
  const params = new URLSearchParams();
  if (searchParams.page) params.set("page", searchParams.page);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.status) params.set("status", searchParams.status);
  params.set("limit", "20");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/blogs?${params.toString()}`,
      { headers: { cookie: (await headers()).get("cookie") || "" } }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error fetching blogs:", error);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminBlogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getBlogs(params);

  if (!data) {
    return (
      <div className="p-6 text-center">
        <ErrorState message="Failed to load blogs. Please try again." />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Loading data...</div>}>
      <AdminBlogsClient
      initialData={data.data.data}
      stats={data.data.stats}
      pagination={data.pagination}
      searchParams={params}
    />
    </Suspense>
  );
}
