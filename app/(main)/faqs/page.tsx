"use client";

import { useState, useMemo, useCallback } from "react";
import { FAQS, FAQ_CATEGORIES } from "@/constants/faqs";
import FAQHero from "@/components/faqs/FAQHero";
import CategoryCarousel from "@/components/faqs/CategoryCarousel";
import FAQSection from "@/components/faqs/FAQSection";
import FAQContactCTA from "@/components/faqs/FAQContactCTA";

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Filter FAQs based on search query
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;

    const query = searchQuery.toLowerCase();
    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group FAQs by category
  const groupedFAQs = useMemo(() => {
    const groups: Record<string, typeof FAQS> = {};
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
      const categoryFAQs = FAQS.filter((faq) => faq.category === categoryId);
      if (categoryFAQs.length > 0) {
        setExpandedItemId(categoryFAQs[0].id);
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
  }, []);

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Determine which categories to show
  const categoriesToShow = selectedCategory
    ? FAQ_CATEGORIES.filter((cat) => cat.id === selectedCategory)
    : FAQ_CATEGORIES.filter((cat) => groupedFAQs[cat.id]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

              return (
                <FAQSection
                  key={category.id}
                  categoryId={category.id}
                  categoryName={category.name}
                  categoryIcon={category.icon}
                  faqs={categoryFAQs}
                  defaultOpenId={defaultOpenId}
                />
              );
            })}
          </div>
        )}

        {/* Contact Support CTA */}
        <FAQContactCTA />
      </div>
    </>
  );
}