import { MetadataRoute } from "next";

export const revalidate = 172800; // 48 hours

const getTemplates = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mhd-store.vercel.app";
    const res = await fetch(`${baseUrl}/api/template`, {
      next: { revalidate: 172800, tags: ["templates"] },
    });
    if (!res.ok) throw new Error("Failed to fetch templates");
    const json = await res.json();
    const templates = json.data || [];
    return templates.filter((t: any) => t.isActive);
  } catch (error) {
    console.error("Error fetching templates for sitemap:", error);
    return [];
  }
};

const getBlogs = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mhd-store.vercel.app";
    const res = await fetch(`${baseUrl}/api/blogs?limit=100`, {
      next: { revalidate: 172800, tags: ["blogs"] },
    });
    if (!res.ok) throw new Error("Failed to fetch blogs");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
    return [];
  }
};



export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://mhd-store.vercel.app";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  const templates = await getTemplates();
  const templatePages = templates.map((template: any) => ({
    url: `${baseUrl}/templates/${template._id}`,
    lastModified: template.updatedAt
      ? new Date(template.updatedAt)
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogs = await getBlogs();
  const blogPages = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug || blog._id}`,
    lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...templatePages, ...blogPages];
}
