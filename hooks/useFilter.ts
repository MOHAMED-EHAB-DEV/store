"use client";
import { useState, useCallback, useMemo, useRef } from "react";
import { ICategory, ITemplate } from "@/types";
import { builtWithOptions } from "@/constants";

type SelectedCategory = { selected: boolean } & ICategory;

export const useFilters = (
  initialCategories: ICategory[],
  templates: ITemplate[],
  searchParams?: {
    builtWith: string[] | string;
    categories: string[] | string;
    tags: string[] | string;
  },
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [sortedBy, setSortedBy] = useState<
    "popular" | "recent" | "rating" | "price" | "downloads"
  >("popular");

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
