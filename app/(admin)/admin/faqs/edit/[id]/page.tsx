import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/faqs/${id}`);

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
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/faqs"
                    className="text-muted-foreground hover:text-white transition-colors"
                >
                    ← Back to FAQs
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-white">Edit FAQ</h1>
                <p className="text-muted-foreground">Update the FAQ entry</p>
            </div>

            <FAQForm initialData={faq} isEdit />
        </div>
    );
}
