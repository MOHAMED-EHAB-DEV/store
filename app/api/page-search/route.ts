import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import Category from "@/lib/models/Category";
import Blog from "@/lib/models/Blog";

export interface SearchResultItem {
  id: string;
  title: string;
  category: "Page" | "Service" | "Templates" | "Category" | "Blog" | "Support";
  url: string;
  iconName: "templates" | "code" | "pricing" | "blog" | "faq" | "support" | "dashboard" | "folder" | "article";
}

const STATIC_ITEMS: SearchResultItem[] = [
  { id: "p-home", title: "Home", category: "Page", url: "/", iconName: "dashboard" },
  { id: "p-templates", title: "All Templates", category: "Templates", url: "/templates", iconName: "templates" },
  { id: "p-custom", title: "Custom Development", category: "Service", url: "/custom-development", iconName: "code" },
  { id: "p-pricing", title: "Pricing & Lifetime Plans", category: "Page", url: "/pricing", iconName: "pricing" },
  { id: "p-blog", title: "Blog & Tutorials", category: "Blog", url: "/blog", iconName: "blog" },
  { id: "p-faqs", title: "Frequently Asked Questions", category: "Support", url: "/faqs", iconName: "faq" },
  { id: "p-support", title: "Customer Support & Chat", category: "Support", url: "/support", iconName: "support" },
  { id: "p-dash", title: "Client Dashboard", category: "Page", url: "/dashboard", iconName: "dashboard" },
];

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const [templates, categories, blogs] = await Promise.all([
      Template.find({ isActive: true })
        .select("title slug")
        .limit(30)
        .lean(),
      Category.find({ isActive: true })
        .select("name slug")
        .limit(20)
        .lean(),
      Blog.find({ isPublished: true })
        .select("title slug")
        .limit(10)
        .lean()
        .catch(() => []),
    ]);

    const dynamicTemplates: SearchResultItem[] = (templates || []).map((t: any) => ({
      id: `t-${t._id}`,
      title: t.title,
      category: "Templates",
      url: `/templates/${t.slug}`,
      iconName: "templates",
    }));

    const dynamicCategories: SearchResultItem[] = (categories || []).map((c: any) => ({
      id: `c-${c._id}`,
      title: `${c.name} Templates`,
      category: "Category",
      url: `/templates?categories=${encodeURIComponent(c.slug || c.name)}`,
      iconName: "folder",
    }));

    const dynamicBlogs: SearchResultItem[] = (blogs || []).map((b: any) => ({
      id: `b-${b._id}`,
      title: b.title,
      category: "Blog",
      url: `/blog/${b.slug}`,
      iconName: "article",
    }));

    const allItems: SearchResultItem[] = [
      ...STATIC_ITEMS,
      ...dynamicCategories,
      ...dynamicTemplates,
      ...dynamicBlogs,
    ];

    return NextResponse.json({ success: true, data: allItems });
  } catch (error) {
    console.error("Page search index error:", error);
    // Fallback to static items on error
    return NextResponse.json({ success: true, data: STATIC_ITEMS });
  }
}
