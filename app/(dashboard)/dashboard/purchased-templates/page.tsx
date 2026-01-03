import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PurchasedTemplatesClient from "@/components/Dashboard/PurchasedTemplatesClient";
import { authenticateUser } from "@/middleware/auth";

export const metadata: Metadata = {
    title: "Purchased Templates | Dashboard",
    description: "View and manage your purchased templates"
};

export const dynamic = "force-dynamic";

async function getPurchasedTemplates() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const [templatesRes, categoriesRes] = await Promise.all([
            fetch(`${baseUrl}/api/user/templates`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            }),
            fetch(`${baseUrl}/api/categories`, {
                cache: "no-store"
            })
        ]);

        const templates = templatesRes.ok ? await templatesRes.json() : { data: [] };
        const categories = categoriesRes.ok ? await categoriesRes.json() : { data: [] };

        return {
            templates: templates.data || [],
            categories: categories.data || [],
        };
    } catch (error) {
        console.error("Error fetching templates:", error);
        return { templates: [], categories: [] };
    }
}

export default async function PurchasedTemplatesPage() {
    const user = await authenticateUser(true, false, true);
    if (!user) redirect("/");

    const data = await getPurchasedTemplates();

    return <PurchasedTemplatesClient templates={data.templates} categories={data.categories} />;
}