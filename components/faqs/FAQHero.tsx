"use client";

import { Input } from "@/components/ui/input";

interface FAQHeroProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export default function FAQHero({ searchQuery, onSearchChange }: FAQHeroProps) {
    return (
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Hello, How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Find answers to common questions about our products, shipping, returns, and more.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <Input
                    type="text"
                    placeholder="Search for questions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-12 h-14 text-base rounded-full border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 dark:focus:border-purple-500 focus-visible:ring-purple-500 transition-colors"
                />
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
        </div>
    );
}
