"use client"
import { useState, useEffect, useRef } from 'react';
import { ITemplate } from '@/types';

export const useTemplates = (
    initialData: ITemplate[],
    searchQuery: string,
    selectedCategories: { _id: string; selected: boolean }[],
    selectedTags: { tag: string; selected: boolean }[],
    selectedBuiltWithOptions: { text: string; selected: boolean }[],
    minPrice: number,
    maxPrice: number,
    minRating: number,
    sortedBy: string
) => {
    const [templates, setTemplates] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchTemplates = async () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();
            setIsLoading(true);

            try {
                const categories = selectedCategories
                    .filter(({ selected }) => selected)
                    .map(({ _id }) => _id)
                    .join(',');

                const tags = selectedTags
                    .filter(({ selected }) => selected)
                    .map(({ tag }) => tag)
                    .join(',');

                const builtWith = selectedBuiltWithOptions
                    .filter(({ selected }) => selected)
                    .map(({ text }) => text.toLowerCase())
                    .join(',');

                const params = new URLSearchParams({
                    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
                    ...(categories && { categories }),
                    ...(tags && { tags }),
                    ...(builtWith && { builtWith }),
                    ...(minPrice ? { minPrice: String(minPrice) } : {}),
                    ...(maxPrice ? { maxPrice: String(maxPrice) } : {}),
                    ...(minRating ? { minRating: String(minRating) } : {}),
                    sortBy: sortedBy,
                });

                const res = await fetch(`/api/template/search?${params.toString()}`, {
                    signal: abortControllerRef.current.signal,
                });

                if (!res.ok) throw new Error('Failed to fetch templates');

                const data = await res.json();
                setTemplates(data.data);
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Error fetching templates:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, [
        debouncedSearchQuery,
        selectedCategories,
        selectedTags,
        selectedBuiltWithOptions,
        minPrice,
        maxPrice,
        minRating,
        sortedBy,
    ]);

    return { templates, isLoading };
};
