import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import Blog from "@/lib/models/Blog";

export const revalidate = 172800; // 48 hours

const getTemplates = async () => {
  try {
    await connectToDatabase();
    const templates = await Template.find({ isActive: true })
      .select("slug _id updatedAt")
      .lean();
    return templates;
  } catch (error) {
    console.error("Error fetching templates for sitemap:", error);
    return [];
  }
};

const getBlogs = async () => {
  try {
    await connectToDatabase();
    const blogs = await Blog.find()
      .select("slug updatedAt")
      .lean();
    return blogs;
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
      lastModified: new Date("2024-01-01"),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date("2024-01-01"),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date("2024-01-01"),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date("2024-01-01"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ];

  const templates = await getTemplates();
  const templatePages = templates.map((template: any) => ({
    url: `${baseUrl}/templates/${template.slug || template._id}`,
    lastModified: template.updatedAt || new Date(),
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
