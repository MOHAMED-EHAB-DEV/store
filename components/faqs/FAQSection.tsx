"use client";

import { Accordion } from "@/components/ui/accordion";
import { FAQ } from "@/constants/faqs";
import FAQItem from "./FAQItem";

interface FAQSectionProps {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    faqs: FAQ[];
    defaultOpenId?: string;
}

export default function FAQSection({
    categoryId,
    categoryName,
    categoryIcon,
    faqs,
    defaultOpenId,
}: FAQSectionProps) {
    if (faqs.length === 0) return null;

    return (
        <div id={categoryId} className="scroll-mt-24">
            <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                    <span className="text-3xl">{categoryIcon}</span>
                    {categoryName}
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full mt-3 shadow-lg shadow-purple-500/50" />
            </div>

            <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={defaultOpenId}
            >
                {faqs.map((faq) => (
                    <FAQItem key={faq.id} faq={faq} />
                ))}
            </Accordion>
        </div>
    );
}
