"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { ITemplate } from "@/types";

export const useTemplates = (
  initialData: ITemplate[],
  searchQuery: string,
  selectedCategories: { _id: string; selected: boolean }[],
  selectedTags: { tag: string; selected: boolean }[],
  selectedBuiltWithOptions: { text: string; selected: boolean }[],
  minPrice: number,
  maxPrice: number,
  minRating: number,
  sortedBy: string,
) => {
  const [templates, setTemplates] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialDataRef = useRef(initialData);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categoriesParam = useMemo(
    () =>
      selectedCategories
        .filter((c) => c.selected)
        .map((c) => c._id)
        .join(","),
    [selectedCategories],
  );
  const tagsParam = useMemo(
    () =>
      selectedTags
        .filter((t) => t.selected)
        .map((t) => t.tag)
        .join(","),
    [selectedTags],
  );
  const builtWithParam = useMemo(
    () =>
      selectedBuiltWithOptions
        .filter((b) => b.selected)
        .map((b) => b.text.toLowerCase())
        .join(","),
    [selectedBuiltWithOptions],
  );

  const hasFilters =
    !!debouncedSearchQuery ||
    !!categoriesParam ||
    !!tagsParam ||
    !!builtWithParam ||
    minPrice > 0 ||
    maxPrice > 0 ||
    minRating > 0 ||
    sortedBy !== "default";

  useEffect(() => {
    if (!hasFilters) {
      setTemplates(initialDataRef.current);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    const params = new URLSearchParams({
      ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      ...(categoriesParam && { categories: categoriesParam }),
      ...(tagsParam && { tags: tagsParam }),
      ...(builtWithParam && { builtWith: builtWithParam }),
      ...(minPrice && { minPrice: String(minPrice) }),
      ...(maxPrice && { maxPrice: String(maxPrice) }),
      ...(minRating && { minRating: String(minRating) }),
      sortBy: sortedBy,
    });

    fetch(`/api/template/search?${params}`, {
      signal: abortControllerRef.current.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setTemplates(data.data))
      .catch((error) => {
        if (error?.name !== "AbortError") console.error(error);
      })
      .finally(() => setIsLoading(false));
  }, [
    hasFilters,
    debouncedSearchQuery,
    categoriesParam,
    tagsParam,
    builtWithParam,
    minPrice,
    maxPrice,
    minRating,
    sortedBy,
  ]);

  return { templates, isLoading };
};
