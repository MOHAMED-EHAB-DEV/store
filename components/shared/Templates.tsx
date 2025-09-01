"use client";

import React, {useState, useEffect, Suspense, useRef, useCallback} from 'react';
import FilterOptions from "@/components/shared/FilterOptions";
import Template from "@/components/shared/Template";
import TemplateSkeleton from "@/components/ui/TemplateSkeleton";
import {builtWithOptions} from "@/constants";
import {Search} from "@/components/ui/svgs/Icons";

declare type selected = {
    selected: boolean,
}

const Templates = ({initialData, categories, isHome = false}: {
    initialData: ITemplate[],
    categories: ICategory[],
    isHome?: Boolean
}) => {
    const isFirstRender = useRef(true);
    const [templates, setTemplates] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<(selected & ICategory)[]>(
        categories.map((category) => ({
            ...category,
            selected: false,
        }))
    );
    const [minRating, setMinRating] = useState<number>(0);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(0);
    const [sortedBy, setSortedBy] = useState<"popular" | "recent" | "rating" | "price" | "downloads">("popular");

    const uniqueTags = Array.from(
        new Set(templates.flatMap((template) => template.tags))
    ).map((tag) => ({
        tag,
        selected: false,
    }));
    const uniqueBuiltWithOptions = Array.from(new Set(builtWithOptions.flatMap((option) => option))).map((option) => ({
        ...option,
        selected: false,
    }))

    const [selectedBuiltWithOptions, setSelectedBuiltWithOptions] = useState<{
        Icon: ({className}: { className: string }) => React.JSX.Element,
        text: string,
        selected: boolean
    }[]>(uniqueBuiltWithOptions);
    const [selectedTags, setSelectedTags] = useState<{ tag: string; selected: boolean }[]>(uniqueTags);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const fetchTemplates = async () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();
            setIsLoading(true);
            try {
                const categories = selectedCategories
                    .filter(({selected}) => selected)
                    .map(({_id}) => _id)
                    .join(",");

                const tags = selectedTags
                    .filter(({selected}) => selected)
                    .map(({tag}) => tag)
                    .join(",");

                const builtWith = selectedBuiltWithOptions
                    .filter(({selected}) => selected)
                    .map(({text}) => text.toLowerCase())
                    .join(",");

                const params = new URLSearchParams({
                    ...(debouncedSearchQuery && {search: debouncedSearchQuery}),
                    ...(categories && {categories}),
                    ...(tags && {tags}),
                    ...(builtWith && {builtWith}),
                    ...(minPrice ? {minPrice: String(minPrice)} : {}),
                    ...(maxPrice ? {maxPrice: String(maxPrice)} : {}),
                    ...(minRating ? {minRating: String(minRating)} : {}),
                    sortBy: sortedBy,
                });

                const res = await fetch(`/api/template/search?${params.toString()}`, {
                    signal: abortControllerRef.current.signal
                });
                if (!res.ok) throw new Error("Failed to fetch templates");

                const data = await res.json();
                setTemplates(data.data);
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error("Error fetching templates:", error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, [debouncedSearchQuery, selectedCategories, selectedTags, selectedBuiltWithOptions, minPrice, maxPrice, minRating, sortedBy]);

    return (
        <div className="flex flex-col gap-5">
            {isHome ? (
                <div className="relative w-full flex-1">
                    <Search className="absolute left-4 z-20 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                        placeholder="Search..."
                        required
                    />
                </div>
            ) : <FilterOptions
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
            />}

            <div className={isHome ? "grid grid-cols-1 md:grid-cols-[30%_1fr] gap-4" : ""}>
                {isHome && <FilterOptions
                    isHome={isHome}
                    categories={selectedCategories} setCategories={setSelectedCategories}
                    tags={selectedTags} setTags={setSelectedTags}
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
                />}
                <Suspense fallback={
                    <div className="flex items-center justify-center flex-wrap gap-6">
                        {[...Array(6)].map((_, idx) => (
                            <TemplateSkeleton key={idx}/>
                        ))}
                    </div>
                }>
                    {isLoading ? (
                        <div className="flex items-center justify-center flex-wrap gap-6">
                            {[...Array(6)].map((_, idx) => (
                                <TemplateSkeleton key={idx}/>
                            ))}
                        </div>
                    ) : templates.length > 0 ? (
                        <div className={`grid grid-cols-1 ${isHome ? "md:grid-cols-2" : "md:grid-cols-3"} gap-5`}>
                            {templates.map((template, idx) => <Template showActionButtons={true} showPrice={true}
                                                                        key={template._id} template={template}
                                                                        idx={idx}/>)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center  text-center py-12">
                            <div className="w-32 h-32 mb-4">
                                <Search className="w-full h-full text-gray-400 opacity-60"/>
                            </div>
                            <h3 className="text-lg font-semibold text-white/90 mb-2">
                                No templates found
                            </h3>
                            <p className="text-sm text-gray-400 mb-4 max-w-md">
                                {searchQuery || selectedCategories.some(c => c.selected) || selectedTags.some(t => t.selected) || selectedBuiltWithOptions.some(b => b.selected) || sortedBy !== "popular" || minPrice !== 0 || maxPrice !== 0 || minRating !== 0
                                    ? "Try adjusting your search or clearing filters to see more results."
                                    : "We don’t have any templates available right now. Please check back soon or contact support."}
                            </p>
                            <div className="flex gap-3">
                                {(searchQuery || selectedCategories.some(c => c.selected) || selectedTags.some(t => t.selected) || selectedBuiltWithOptions.some(b => b.selected) || sortedBy !== "popular" || minPrice !== 0 || maxPrice !== 0 || minRating !== 0) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategories(categories.map(c => ({...c, selected: false})));
                                            setSelectedTags((prev) => prev.map(t => ({...t, selected: false})));
                                            setSelectedBuiltWithOptions((prev) => prev.map(b => ({
                                                ...b,
                                                selected: false
                                            })));
                                            setSortedBy("popular");
                                            setMinPrice(0)
                                            setMaxPrice(0)
                                            setMinRating(0)
                                        }}
                                        className="px-4 py-2 rounded-lg bg-gold text-black font-medium hover:bg-yellow-500 transition"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-white/10 transition"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    )
}
export default Templates;