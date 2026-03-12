"use client";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ICategory, ITemplate } from "@/types";
import { builtWithOptions } from "@/constants";

type SelectedCategory = { selected: boolean } & ICategory;

export const useFilters = (
  initialCategories: ICategory[],
  templates: ITemplate[],
  searchParams?: {
    builtWith?: string[] | string;
    categories?: string[] | string;
    tags?: string[] | string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: string;
  },
) => {
  const [searchQuery, setSearchQuery] = useState(
    (searchParams?.search as string) || "",
  );
  const [minPrice, setMinPrice] = useState(
    Number(searchParams?.minPrice) || 0,
  );
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams?.maxPrice) || 0,
  );
  const [minRating, setMinRating] = useState(
    Number(searchParams?.minRating) || 0,
  );
  const [sortedBy, setSortedBy] = useState<
    "popular" | "recent" | "rating" | "price" | "downloads"
  >((searchParams?.sortBy as any) || "popular");

  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategory[]
  >(() =>
    initialCategories.map((category) => ({
      ...category,
      selected: Array.isArray(searchParams?.categories)
        ? searchParams.categories.some((c) => c === category.name)
        : searchParams?.categories === category.name,
    })),
  );

  const [selectedTags, setSelectedTags] = useState(() =>
    Array.from(new Set(templates.flatMap((t) => t.tags))).map((tag) => ({
      tag,
      selected: Array.isArray(searchParams?.tags)
        ? searchParams.tags.some((t) => t === tag)
        : searchParams?.tags === tag,
    })),
  );

  const [selectedBuiltWithOptions, setSelectedBuiltWithOptions] = useState(() =>
    builtWithOptions.map((option) => ({
      ...option,
      selected: Array.isArray(searchParams?.builtWith)
        ? searchParams.builtWith.some((b) => b === option.text)
        : searchParams?.builtWith === option.text,
    })),
  );

  // Sync with searchParams prop (reactive to URL changes)
  useEffect(() => {
    if (searchParams) {
      if (searchParams.search !== undefined && searchParams.search !== searchQuery) {
        setSearchQuery(searchParams.search);
      }
      if (searchParams.minPrice !== undefined) {
        const val = Number(searchParams.minPrice) || 0;
        if (val !== minPrice) setMinPrice(val);
      }
      if (searchParams.maxPrice !== undefined) {
        const val = Number(searchParams.maxPrice) || 0;
        if (val !== maxPrice) setMaxPrice(val);
      }
      if (searchParams.minRating !== undefined) {
        const val = Number(searchParams.minRating) || 0;
        if (val !== minRating) setMinRating(val);
      }
      if (searchParams.sortBy !== undefined && searchParams.sortBy !== sortedBy) {
        setSortedBy(searchParams.sortBy as any);
      }

      // Sync categories
      if (searchParams.categories !== undefined) {
        setSelectedCategories(prev => prev.map(cat => ({
          ...cat,
          selected: Array.isArray(searchParams.categories)
            ? searchParams.categories.some(c => c === cat.name)
            : searchParams.categories === cat.name
        })));
      }

      // Sync tags
      if (searchParams.tags !== undefined) {
        setSelectedTags(prev => prev.map(t => ({
          ...t,
          selected: Array.isArray(searchParams.tags)
            ? searchParams.tags.some(tag => tag === t.tag)
            : searchParams.tags === t.tag
        })));
      }

      // Sync builtWith
      if (searchParams.builtWith !== undefined) {
        setSelectedBuiltWithOptions(prev => prev.map(opt => ({
          ...opt,
          selected: Array.isArray(searchParams.builtWith)
            ? searchParams.builtWith.some(b => b === opt.text)
            : searchParams.builtWith === opt.text
        })));
      }
    }
  }, [searchParams]);

  const initialTagsRef = useRef(
    Array.from(new Set(templates.flatMap((t) => t.tags))).map((tag) => ({
      tag,
      selected: false,
    })),
  );
  const initialBuiltWithRef = useRef(
    builtWithOptions.map((o) => ({ ...o, selected: false })),
  );
  const initialCategoriesRef = useRef(
    initialCategories.map((c) => ({ ...c, selected: false })),
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setMinPrice(0);
    setMaxPrice(0);
    setMinRating(0);
    setSortedBy("popular");
    setSelectedCategories(initialCategoriesRef.current);
    setSelectedTags(initialTagsRef.current);
    setSelectedBuiltWithOptions(initialBuiltWithRef.current);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      searchQuery !== "" ||
      minPrice !== 0 ||
      maxPrice !== 0 ||
      minRating !== 0 ||
      sortedBy !== "popular" ||
      selectedCategories.some((c) => c.selected) ||
      selectedTags.some((t) => t.selected) ||
      selectedBuiltWithOptions.some((b) => b.selected),
    [
      searchQuery,
      minPrice,
      maxPrice,
      minRating,
      sortedBy,
      selectedCategories,
      selectedTags,
      selectedBuiltWithOptions,
    ],
  );

  return {
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
  };
};

