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
                Find answers to common questions about our templates, licensing, downloads, pricing, and support.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
                <Input
                    type="text"
                    placeholder="Search for questions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    startContent={
                        <svg
                            className="h-5 w-5 text-purple-500"
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
                    }
                    isClearable
                    onClear={() => onSearchChange("")}
                    classNames={{
                        inputWrapper: "h-14 text-base rounded-full border-2 border-purple-200 dark:border-purple-800 focus-within:border-purple-500 dark:focus-within:border-purple-500 focus-within:ring-purple-500 transition-colors"
                    }}
                />
            </div>
        </div>
    );
}
