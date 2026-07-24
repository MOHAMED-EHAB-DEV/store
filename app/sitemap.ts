import { MetadataRoute } from "next";

const getTemplates = async (baseUrl: string) => {
  try {
    const res = await fetch(
      `${baseUrl}/api/template/search?includedFields=updatedAt&limit=1000`,
      { next: { tags: ["sitemap", "templates"], revalidate: 2 * 60 * 60 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching templates for sitemap:", error);
    return [];
  }
};

const getBlogs = async (baseUrl: string) => {
  try {
    const res = await fetch(`${baseUrl}/api/blogs?limit=1000`, {
      next: { tags: ["sitemap", "blogs"], revalidate: 2 * 60 * 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
    return [];
  }
};

const getCategories = async (baseUrl: string) => {
  try {
    const res = await fetch(`${baseUrl}/api/categories`, {
      next: { tags: ["sitemap", "categories"], revalidate: 2 * 60 * 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
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
      url: `${baseUrl}/custom-development`,
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

  const templates = await getTemplates(baseUrl);
  const templatePages = templates.map((template: any) => ({
    url: `${baseUrl}/templates/${template.slug}`,
    lastModified: template.updatedAt ? new Date(template.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogs = await getBlogs(baseUrl);
  const blogPages = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categories = await getCategories(baseUrl);
  const categoryPages = categories.map((category: any) => ({
    url: `${baseUrl}/templates/category/${category.slug}`,
    lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...templatePages, ...blogPages, ...categoryPages];
}
