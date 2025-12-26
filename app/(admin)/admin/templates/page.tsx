import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminTemplatesClient from "@/components/Admin/AdminTemplatesClient";
import { authenticateUser } from "@/middleware/auth";
import { ErrorState } from "@/components/Dashboard/shared/LoadingStates";

export const metadata: Metadata = {
    title: "Templates Management | Admin Dashboard",
    description: "Manage all templates, categories, and downloads",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getTemplatesData() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const [templatesRes, categoriesRes] = await Promise.all([
            fetch(`${baseUrl}/api/template/search?includedFields=isActive,downloads`, {
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
        console.error("Error fetching templates data:", error);
        return null;
    }
}

export default async function AdminTemplatesPage() {
    const user = await authenticateUser(true, true, true);
    if (!user) redirect("/");

    const data = await getTemplatesData();

    if (!data) {
        return <ErrorState message="Failed to load templates. Please refresh the page." />;
    }

    return <AdminTemplatesClient templates={data.templates} categories={data.categories} />;
}