"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ITemplate } from "@/types";

export const useTemplates = (
  initialData: ITemplate[],
  searchQuery: string,
  selectedCategories: any[],
  selectedTags: { tag: string; selected: boolean }[],
  selectedBuiltWithOptions: { text: string; selected: boolean }[],
  minPrice: number,
  maxPrice: number,
  minRating: number,
  sortedBy: string,
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialDataRef = useRef(initialData);
  const isInitialMount = useRef(true);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categoriesApiParam = useMemo(
    () =>
      selectedCategories
        .filter((c) => c.selected)
        .map((c) => c._id)
        .join(","),
    [selectedCategories],
  );

  const categoriesUrlParam = useMemo(
    () =>
      selectedCategories
        .filter((c) => c.selected)
        .map((c) => c.slug || c.name || c._id)
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

  const hasActiveFilters = useMemo(
    () =>
      !!debouncedSearchQuery ||
      !!categoriesApiParam ||
      !!tagsParam ||
      !!builtWithParam ||
      minPrice > 0 ||
      maxPrice > 0 ||
      minRating > 0 ||
      (sortedBy !== "default" && sortedBy !== "popular"),
    [
      debouncedSearchQuery,
      categoriesApiParam,
      tagsParam,
      builtWithParam,
      minPrice,
      maxPrice,
      minRating,
      sortedBy,
    ],
  );

  // Sync state to URL
  useEffect(() => {
    if (isInitialMount.current) return;

    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (categoriesUrlParam) params.set("categories", categoriesUrlParam);
    if (tagsParam) params.set("tags", tagsParam);
    if (builtWithParam) params.set("builtWith", builtWithParam);
    if (minPrice > 0) params.set("minPrice", String(minPrice));
    if (maxPrice > 0) params.set("maxPrice", String(maxPrice));
    if (minRating > 0) params.set("minRating", String(minRating));
    if (sortedBy !== "popular" && sortedBy !== "default")
      params.set("sortBy", sortedBy);

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.replace(`?${newQuery}`, { scroll: false });
    }
  }, [
    debouncedSearchQuery,
    categoriesUrlParam,
    tagsParam,
    builtWithParam,
    minPrice,
    maxPrice,
    minRating,
    sortedBy,
    router,
    searchParams,
  ]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // If we have filters on mount, we assume initialData already reflects them
      // because the server component fetches using the same searchParams.
      if (hasActiveFilters) return;
    }

    if (!hasActiveFilters) {
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
      ...(categoriesApiParam && { categories: categoriesApiParam }),
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
    hasActiveFilters,
    debouncedSearchQuery,
    categoriesApiParam,
    tagsParam,
    builtWithParam,
    minPrice,
    maxPrice,
    minRating,
    sortedBy,
  ]);

  return { templates, isLoading };
};

