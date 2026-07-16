'use client';

import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import { Button } from "@/components/ui/button";

const BackToTop = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="relative mt-4 group w-fit">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <Button
                variant="ghost"
                size="icon"
                onClick={scrollToTop}
                className="relative cursor-pointer flex items-center justify-center w-12 h-12 bg-transparent text-white rounded-full border-2 border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Back to top"
            >
                <ChevronUp strokeWidth={3} className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
            </Button>
        </div>
    );
};

export default BackToTop;