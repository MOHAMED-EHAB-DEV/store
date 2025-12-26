import { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminCategoriesClient from "@/components/Admin/AdminCategoriesClient";
import { authenticateUser } from "@/middleware/auth";

export const metadata: Metadata = {
    title: "Categories Management | Admin Dashboard",
    description: "Manage template categories and organization",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getCategories() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/categories`, {
            cache: "no-store"
        });

        const data = response.ok ? await response.json() : { data: [] };
        return data.data || [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export default async function AdminCategoriesPage() {
    const user = await authenticateUser(true, true, true);
    if (!user) redirect("/");

    const categories = await getCategories();

    return <AdminCategoriesClient categories={categories} />;
}
