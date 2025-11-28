"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FAQ_CATEGORIES } from "@/constants/faqs";
import { ChevronRight } from "@/components/ui/svgs/Icons";

interface CategoryCarouselProps {
    selectedCategory: string | null;
    onCategorySelect: (categoryId: string | null) => void;
}

export default function CategoryCarousel({
    selectedCategory,
    onCategorySelect,
}: CategoryCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "center",
        loop: false,
        dragFree: true,
        containScroll: "trimSnaps",
        startIndex: 2,
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // Center the carousel on mount
    useEffect(() => {
        if (emblaApi) {
            emblaApi.reInit();
        }
    }, [emblaApi]);

    return (
        <div className="relative mb-12 py-4">
            {/* Left Arrow */}
            <button
                onClick={scrollPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 border-2 border-purple-300 dark:border-purple-700 rounded-full p-3 shadow-xl hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-500 transition-all duration-200"
                aria-label="Scroll left"
            >
                <ChevronRight className="h-5 w-5 text-purple-600 dark:text-purple-400 rotate-180" />
            </button>

            {/* Embla Carousel Container */}
            <div className="overflow-visible px-14" ref={emblaRef}>
                <div className="flex gap-5 touch-pan-y">
                    {/* Category Cards */}
                    {FAQ_CATEGORIES.map((category) => (
                        <div key={category.id} className="flex-[0_0_auto] w-64">
                            <button
                                onClick={() => onCategorySelect(category.id === selectedCategory ? null : category.id)}
                                className={`w-full h-[200px] rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border-2 transition-all duration-300 shadow-lg hover:shadow-2xl ${selectedCategory === category.id ? "bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 border-transparent text-white scale-105" : "bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800 hover:border-purple-500 dark:hover:border-purple-500 hover:scale-105"}`}
                            >
                                <div className={`text-5xl ${selectedCategory === category.id ? "animate-bounce" : ""}`}>
                                    {category.icon}
                                </div>
                                <div className="text-center">
                                    <h3 className={`text-xl font-bold ${selectedCategory === category.id ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                        {category.name}
                                    </h3>
                                    {/* <p className={`text-sm mt-1 ${selectedCategory === category.id ? "text-white/90" : "text-muted-foreground"}`}>
                                        Click to explore
                                    </p> */}
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Arrow */}
            <button
                onClick={scrollNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 border-2 border-purple-300 dark:border-purple-700 rounded-full p-3 shadow-xl hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-500 transition-all duration-200"
                aria-label="Scroll right"
            >
                <ChevronRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </button>
        </div>
    );
}
