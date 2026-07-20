"use client";

import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FAQ_CATEGORIES } from "@/constants/faqs";

interface CategoryCarouselProps {
    selectedCategory: string | null;
    onCategorySelect: (categoryId: string | null) => void;
}

export default function CategoryCarousel({
    selectedCategory,
    onCategorySelect,
}: CategoryCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: false,
        dragFree: true,
        containScroll: "trimSnaps",
        breakpoints: {
            '(min-width: 768px)': { active: false }
        }
    });

    // Update selected index to ensure it is visible on mobile
    useEffect(() => {
        if (emblaApi && selectedCategory && emblaApi.internalEngine().options.active) {
            const index = FAQ_CATEGORIES.findIndex(c => c.id === selectedCategory);
            if (index !== -1) {
                // Add 1 to account for the "All Questions" button
                emblaApi.scrollTo(index + 1);
            }
        }
    }, [emblaApi, selectedCategory]);

    return (
        <div className="relative mb-12">
            {/* Carousel / Flex Container */}
            <div className="overflow-hidden md:overflow-visible px-4 md:px-0" ref={emblaRef}>
                <div className="flex gap-3 py-4 flex-nowrap md:flex-wrap md:justify-center w-full touch-pan-y">
                    {/* All Category Pill */}
                    <button
                        onClick={() => onCategorySelect(null)}
                        className={`flex-[0_0_auto] px-6 py-2.5 rounded-full font-medium transition-all duration-300 border backdrop-blur-sm ${
                            selectedCategory === null 
                            ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                            : "bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white"
                        }`}
                    >
                        All Questions
                    </button>

                    {/* Dynamic Category Pills */}
                    {FAQ_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onCategorySelect(category.id === selectedCategory ? null : category.id)}
                            className={`flex-[0_0_auto] px-6 py-2.5 rounded-full font-medium transition-all duration-300 border backdrop-blur-sm flex items-center gap-2 ${
                                selectedCategory === category.id 
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                                : "bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white"
                            }`}
                        >
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Gradient masks for smooth edge fading (Mobile Only) */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#0A0A0B] to-transparent pointer-events-none md:hidden" />
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#0A0A0B] to-transparent pointer-events-none md:hidden" />
        </div>
    );
}
