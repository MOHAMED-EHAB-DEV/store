"use client";

import { Suspense } from 'react';
import FilterOptions from "@/components/shared/FilterOptions";
import Template from "@/components/shared/Template";
import TemplateSkeleton from "@/components/ui/TemplateSkeleton";
import { Search } from "@/components/ui/svgs/icons/Search";
import { ICategory, ITemplate } from '@/types';
import { useFilters } from '@/hooks/useFilter';
import { useTemplates } from '@/hooks/useTemplates';

const Templates = ({ initialData, categories, isHome = false, searchParams }: {
    initialData: ITemplate[],
    categories: ICategory[],
    isHome?: boolean,
    searchParams?: {
        builtWith: string[] | string;
        categories: string[] | string;
        tags: string[] | string;
    };
}) => {
    const {
        searchQuery,
        setSearchQuery,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        minRating,
        setMinRating,
        sortedBy,
        setSortedBy,
        selectedCategories,
        setSelectedCategories,
        selectedTags,
        setSelectedTags,
        selectedBuiltWithOptions,
        setSelectedBuiltWithOptions,
        clearFilters,
        hasActiveFilters,
    } = useFilters(categories, initialData, searchParams);

    const { templates, isLoading } = useTemplates(
        initialData,
        searchQuery,
        selectedCategories,
        selectedTags,
        selectedBuiltWithOptions,
        minPrice,
        maxPrice,
        minRating,
        sortedBy
    );

    const renderTemplates = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center flex-wrap gap-6">
                    {[...Array(6)].map((_, idx) => <TemplateSkeleton key={idx} />)}
                </div>
            );
        }

        if (templates.length > 0) {
            return (
                <div className={`grid grid-cols-1 ${isHome ? "md:grid-cols-2" : "md:grid-cols-3"} gap-5`}>
                    {templates.map((template) => (
                        <Template showActionButtons={true} showPrice={true} key={template._id} template={template} />
                    ))}
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center text-center py-12">
                <div className="w-32 h-32 mb-4">
                    <Search className="w-full h-full text-gray-400 opacity-60" />
                </div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">No templates found</h3>
                <p className="text-sm text-gray-400 mb-4 max-w-md">
                    {hasActiveFilters()
                        ? "Try adjusting your search or clearing filters to see more results."
                        : "We don’t have any templates available right now. Please check back soon or contact support."}
                </p>
                <div className="flex gap-3">
                    {hasActiveFilters() && (
                        <button
                            onClick={clearFilters}
                            aria-label="Clear Filters"
                            className="px-4 py-2 rounded-lg bg-gold text-black font-medium hover:bg-yellow-500 transition"
                        >
                            Clear Filters
                        </button>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        aria-label='Retry'
                        className="px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-white/10 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-5">
            {isHome ? (
                <div className="relative w-full flex-1">
                    <Search className="absolute left-4 z-20 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                        placeholder="Search..."
                        required
                    />
                </div>
            ) : (
                <FilterOptions
                    isHome={isHome}
                    categories={selectedCategories}
                    setCategories={setSelectedCategories}
                    tags={selectedTags}
                    setTags={setSelectedTags}
                    builtWithOptions={selectedBuiltWithOptions}
                    setBuiltWithOptions={setSelectedBuiltWithOptions}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    setMinPrice={setMinPrice}
                    setMaxPrice={setMaxPrice}
                    sortedBy={sortedBy}
                    setSortedBy={setSortedBy}
                    setSearch={setSearchQuery}
                    search={searchQuery}
                />
            )}

            <div className={isHome ? "grid grid-cols-1 md:grid-cols-[30%_1fr] gap-4" : ""}>
                {isHome && (
                    <FilterOptions
                        isHome={isHome}
                        categories={selectedCategories}
                        setCategories={setSelectedCategories}
                        tags={selectedTags}
                        setTags={setSelectedTags}
                        builtWithOptions={selectedBuiltWithOptions}
                        setBuiltWithOptions={setSelectedBuiltWithOptions}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        setMinPrice={setMinPrice}
                        setMaxPrice={setMaxPrice}
                        sortedBy={sortedBy}
                        setSortedBy={setSortedBy}
                        setSearch={setSearchQuery}
                        search={searchQuery}
                    />
                )}
                <Suspense fallback={
                    <div className="flex items-center justify-center flex-wrap gap-6">
                        {[...Array(6)].map((_, idx) => <TemplateSkeleton key={idx} />)}
                    </div>
                }>
                    {renderTemplates()}
                </Suspense>
            </div>
        </div>
    );
};

export default Templates;