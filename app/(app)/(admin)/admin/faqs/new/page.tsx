import { Metadata } from "next";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import FAQForm from "@/components/Admin/FAQForm";

export const metadata: Metadata = {
    title: "Create FAQ | Admin",
    description: "Create a new FAQ entry"
};

export default function NewFAQPage() {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Create New FAQ"
                description="Add a new frequently asked question"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "FAQs", href: "/admin/faqs" },
                    { label: "Create FAQ" }
                ]}
            />

            <FAQForm />
        </div>
    );
}
