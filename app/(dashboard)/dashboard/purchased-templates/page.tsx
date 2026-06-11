import { Metadata } from "next";
import { redirect } from "next/navigation";
import PurchasedTemplatesClient from "@/components/Dashboard/PurchasedTemplatesClient";
import { authenticateUser } from "@/middleware/auth";
import { getCategories as fetchCategories } from "@/static/categories";

export const metadata: Metadata = {
  title: "Purchased Templates | Dashboard",
  description: "View and manage your purchased templates",
};

async function getPurchasedTemplates() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    const [templatesRes, categories] = await Promise.all([
      fetch(`${baseUrl}/api/user/templates`),
      fetchCategories(),
    ]);

    const templates = templatesRes.ok
      ? await templatesRes.json()
      : { data: [] };

    return {
      templates: templates.data || [],
      categories: categories || [],
    };
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error fetching templates:", error);
    return { templates: [], categories: [] };
  }
}

export default async function PurchasedTemplatesPage() {
  const user = await authenticateUser(true);
  if (!user) redirect("/");

  const data = await getPurchasedTemplates();

  return (
    <PurchasedTemplatesClient
      templates={data.templates}
      categories={data.categories}
    />
  );
}
