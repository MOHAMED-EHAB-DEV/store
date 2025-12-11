"use client";

import { useState, useMemo, useCallback } from "react";
import FAQHero from "@/components/faqs/FAQHero";
import CategoryCarousel from "@/components/faqs/CategoryCarousel";
import FAQSection from "@/components/faqs/FAQSection";
import FAQContactCTA from "@/components/faqs/FAQContactCTA";

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    coverImage?: string;
}

interface Category {
    _id: string;
    name: string;
    count: number;
}

interface FAQsClientProps {
    faqs: FAQ[];
    categories: Category[];
}

export default function FAQsClient({ faqs, categories }: FAQsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    // Filter FAQs based on search query
    const filteredFAQs = useMemo(() => {
        if (!searchQuery.trim()) return faqs;

        const query = searchQuery.toLowerCase();
        return faqs.filter(
            (faq) =>
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query)
        );
    }, [searchQuery, faqs]);

    // Group FAQs by category
    const groupedFAQs = useMemo(() => {
        const groups: Record<string, FAQ[]> = {};
        filteredFAQs.forEach((faq) => {
            if (!groups[faq.category]) {
                groups[faq.category] = [];
            }
            groups[faq.category].push(faq);
        });
        return groups;
    }, [filteredFAQs]);

    // Handle category selection with scroll and auto-expand
    const handleCategorySelect = useCallback((categoryId: string | null) => {
        setSelectedCategory(categoryId);

        if (categoryId) {
            // Find first question in category
            const categoryFAQs = faqs.filter((faq) => faq.category === categoryId);
            if (categoryFAQs.length > 0) {
                setExpandedItemId(categoryFAQs[0]._id);
            }

            // Scroll to category section
            setTimeout(() => {
                const element = document.getElementById(categoryId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 100);
        } else {
            setExpandedItemId(null);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [faqs]);

    // Map database categories to component format
    const categoryItems = useMemo(() => {
        return categories.map(cat => ({
            id: cat._id,
            name: cat.name,
            icon: "❓", // Default icon
        }));
    }, [categories]);

    // Determine which categories to show
    const categoriesToShow = selectedCategory
        ? categoryItems.filter((cat) => cat.id === selectedCategory)
        : categoryItems.filter((cat) => groupedFAQs[cat.id]);

    return (
        <div className="container mt-36 mx-auto px-4 py-12 max-w-7xl">
            {/* Hero Section with Search */}
            <FAQHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            {/* Category Carousel */}
            <CategoryCarousel
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
            />

            {/* Results Count */}
            {searchQuery && (
                <div className="mb-6 text-center text-sm text-muted-foreground">
                    Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? "s" : ""} for "{searchQuery}"
                </div>
            )}

            {/* FAQ Sections */}
            {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">
                        No questions found matching your search.
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {categoriesToShow.map((category) => {
                        const categoryFAQs = groupedFAQs[category.id];
                        if (!categoryFAQs || categoryFAQs.length === 0) return null;

                        // Determine default open item
                        const defaultOpenId =
                            selectedCategory === category.id && expandedItemId
                                ? expandedItemId
                                : undefined;

                        // Map FAQs to format expected by FAQSection
                        const sectionFAQs = categoryFAQs.map(faq => ({
                            id: faq._id,
                            question: faq.question,
                            answer: faq.answer,
                            category: faq.category,
                        }));

                        return (
                            <FAQSection
                                key={category.id}
                                categoryId={category.id}
                                categoryName={category.name}
                                categoryIcon={category.icon}
                                faqs={sectionFAQs}
                                defaultOpenId={defaultOpenId}
                            />
                        );
                    })}
                </div>
            )}

            {/* Contact Support CTA */}
            <FAQContactCTA />
        </div>
    );
}
