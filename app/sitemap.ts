import { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import Blog from "@/lib/models/Blog";

const getTemplates = async () => {
  "use cache";
  cacheLife({ revalidate: 60 * 60 * 48 });
  cacheTag("sitemap-templates", "templates");

  try {
    await connectToDatabase();
    const templates = await Template.find({ isActive: true })
      .select("_id updatedAt")
      .lean();
    return JSON.parse(JSON.stringify(templates));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error fetching templates for sitemap:", error);
    return [];
  }
};

const getBlogs = async () => {
  "use cache";
  cacheLife({ revalidate: 60 * 60 * 48 });
  cacheTag("sitemap-blogs", "blogs");

  try {
    await connectToDatabase();
    const blogs = await Blog.find({ isPublished: true })
      .select("_id slug updatedAt")
      .limit(100)
      .lean();
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
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
