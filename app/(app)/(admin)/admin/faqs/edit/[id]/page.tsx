import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import FAQForm from "@/components/Admin/FAQForm";

export const metadata: Metadata = {
    title: "Edit FAQ | Admin",
    description: "Edit FAQ entry"
};

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getFAQ(id: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/faqs/${id}`, { headers: { cookie: (await headers()).get("cookie") || "" } });

        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return null;
    }
}

export default async function EditFAQPage({ params }: PageProps) {
    const { id } = await params;
    const faq = await getFAQ(id);

    if (!faq) {
        notFound();
    }

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Edit FAQ"
                description="Update the FAQ entry"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "FAQs", href: "/admin/faqs" },
                    { label: "Edit FAQ" }
                ]}
            />

            <FAQForm initialData={faq} isEdit />
        </div>
    );
}
