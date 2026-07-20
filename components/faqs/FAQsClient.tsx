"use client";

import { useState, useMemo, useRef } from "react";
import FAQHero from "@/components/faqs/FAQHero";
import CategoryCarousel from "@/components/faqs/CategoryCarousel";
import FAQMasonryCard from "@/components/faqs/FAQMasonryCard";
import CTA from "@/components/shared/CTA";
import { FAQ_CATEGORIES } from "@/constants/faqs";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    coverImage?: string;
}

interface Category {
    id: string;
    name: string;
    count: number;
}

interface FAQsClientProps {
    faqs: FAQ[];
    categories: Category[];
}

export default function FAQsClient({ faqs }: FAQsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Filter FAQs based on search query and selected category
    const filteredFAQs = useMemo(() => {
        let result = faqs;
        
        if (selectedCategory) {
            result = result.filter(faq => faq.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (faq) =>
                    faq.question.toLowerCase().includes(query) ||
                    faq.answer.toLowerCase().includes(query)
            );
        }
        
        return result;
    }, [searchQuery, selectedCategory, faqs]);

    useGSAP(() => {
        if (gridRef.current) {
            const cards = gsap.utils.toArray('.faq-card') as HTMLElement[];
            
            // Clean up existing triggers before creating new ones when filtering
            ScrollTrigger.getAll().forEach(t => t.kill());

            if (cards.length > 0) {
                // Initialize cards as invisible
                gsap.set(cards, { opacity: 0, y: 30, scale: 0.95 });

                ScrollTrigger.batch(cards, {
                    onEnter: (batch) => {
                        gsap.to(batch, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.5,
                            stagger: 0.05,
                            ease: "back.out(1.2)",
                            overwrite: true
                        });
                    },
                    start: "top 85%",
                    once: true // Animate once
                });
            }
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, { dependencies: [selectedCategory, searchQuery], scope: gridRef });

    return (
        <div className="container mt-36 mx-auto px-4 py-12 max-w-7xl">
            {/* Hero Section with Search */}
            <FAQHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            {/* Category Carousel (Pill Filters) */}
            <CategoryCarousel
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
            />

            {/* Results Count */}
            {searchQuery && (
                <div className="mb-8 text-center text-sm font-medium text-purple-400">
                    Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? "s" : ""} for "{searchQuery}"
                </div>
            )}

            {/* Masonry Grid */}
            <div ref={gridRef} className="min-h-[400px]">
                {filteredFAQs.length === 0 ? (
                    <div className="text-center py-24 bg-gray-900/30 rounded-3xl border border-gray-800 backdrop-blur-sm">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-white mb-2">No questions found</h3>
                        <p className="text-gray-400">Try adjusting your search query or selecting a different category.</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                        {filteredFAQs.map((faq, index) => {
                            const categoryData = FAQ_CATEGORIES.find(c => c.id === faq.category);

                            return (
                                <div key={faq.id} className="faq-card break-inside-avoid mb-6 w-full">
                                    <FAQMasonryCard
                                        faq={faq}
                                        categoryIcon={categoryData?.icon}
                                        categoryName={categoryData?.name}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contact Support CTA */}
            <div className="mt-24">
                <CTA hideFaqButton={true} />
            </div>
        </div>
    );
}
