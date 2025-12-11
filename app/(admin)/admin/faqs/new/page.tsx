import { Metadata } from "next";
import Link from "next/link";
import FAQForm from "@/components/Admin/FAQForm";

export const metadata: Metadata = {
    title: "Create FAQ | Admin",
    description: "Create a new FAQ entry"
};

export default function NewFAQPage() {
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
                <h1 className="text-2xl font-bold text-white">Create New FAQ</h1>
                <p className="text-muted-foreground">Add a new frequently asked question</p>
            </div>

            <FAQForm />
        </div>
    );
}
