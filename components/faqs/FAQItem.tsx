"use client";

import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { FAQ } from "@/constants/faqs";

interface FAQItemProps {
    faq: FAQ;
}

export default function FAQItem({ faq }: FAQItemProps) {
    return (
        <AccordionItem value={faq.id}>
            <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
            </AccordionContent>
        </AccordionItem>
    );
}
