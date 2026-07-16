"use client";

import {
  memo,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import FilterBar from "@/components/shared/FilterBar";
import Template from "@/components/shared/Template";
import TemplateSkeleton from "@/components/ui/TemplateSkeleton";
import { Search } from "@/components/ui/svgs/icons/Search";
import { Input } from "@/components/ui/input";
import { ICategory, ITemplate } from "@/types";

const Templates = ({
  initialData,
  categories,
  searchParams,
  hideCategoryFilter = false,
  allTags,
}: {
  initialData: ITemplate[];
  categories: ICategory[];
  searchParams: { [key: string]: string | string[] | undefined };
  hideCategoryFilter?: boolean;
  allTags?: string[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(
    (searchParams.search as string) || "",
  );

  // Update search query state when URL changes externally
  useEffect(() => {
    setSearchQuery((searchParams.search as string) || "");
  }, [searchParams.search]);

  const updateFilters = useCallback(
    (newParams: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(currentSearchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0) ||
          value === "0"
        ) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [currentSearchParams, pathname, router],
  );

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParams.search || "")) {
        updateFilters({ search: searchQuery });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams.search, updateFilters]);

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
      setSearchQuery("");
    });
  };

  const hasActiveFilters = useMemo(() => {
    const keys = Object.keys(searchParams);
    return (
      keys.length > 0 &&
      keys.some(
        (k) =>
          searchParams[k] !== undefined &&
          searchParams[k] !== "" &&
          searchParams[k] !== "0",
      )
    );
  }, [searchParams]);

  const selectedCategories = useMemo(() => {
    const raw = searchParams.categories;
    const selected = Array.isArray(raw)
      ? raw.flatMap((r) => r.split(","))
      : typeof raw === "string"
        ? raw.split(",")
        : [];
    return categories.map((cat) => ({
      ...cat,
      selected: selected.includes(cat.name),
    }));
  }, [categories, searchParams.categories]);

  const allTagsArray = useMemo(
    () => allTags || Array.from(new Set(initialData.flatMap((t) => t.tags))),
    [allTags, initialData],
  );
  const selectedTags = useMemo(() => {
    const raw = searchParams.tags;
    const selected = Array.isArray(raw)
      ? raw.flatMap((r) => r.split(","))
      : typeof raw === "string"
        ? raw.split(",")
        : [];
    return allTagsArray.map((tag) => ({
      tag,
      selected: selected.includes(tag),
    }));
  }, [allTagsArray, searchParams.tags]);



  return (
    <div className="flex flex-col gap-5">
      <div className="w-full flex-1">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          endContent={
            isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold" />
            ) : undefined
          }
          classNames={{
            inputWrapper: "bg-white/5 border-white/10 rounded-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent"
          }}
        />
      </div>

      <div className="flex flex-col gap-6">
        <FilterBar
          categories={selectedCategories}
          setCategories={(updated) => {
            const selected = (updated as any[])
              .filter((c) => c.selected)
              .map((c) => c.name);
            updateFilters({ categories: selected });
          }}
          tags={selectedTags}
          setTags={(updated) => {
            const selected = (updated as any[])
              .filter((t) => t.selected)
              .map((t) => t.tag);
            updateFilters({ tags: selected });
          }}
          minPrice={Number(searchParams.minPrice) || 0}
          maxPrice={Number(searchParams.maxPrice) || 0}
          setMinPrice={(val) => updateFilters({ minPrice: String(val) })}
          setMaxPrice={(val) => updateFilters({ maxPrice: String(val) })}
          minRating={Number(searchParams.minRating) || 0}
          setMinRating={(val) => updateFilters({ minRating: String(val) })}
          sortedBy={(searchParams.sortBy as any) || "popular"}
          setSortedBy={(val) => updateFilters({ sortBy: val })}
          hideCategoryFilter={hideCategoryFilter}
          clearFilters={clearFilters}
        />

        <div className="flex flex-col gap-6 w-full">
          {isPending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <TemplateSkeleton key={idx} />
              ))}
            </div>
          ) : initialData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialData.map((template) => (
                <Template
                  key={template._id}
                  template={template}
                  mode="store"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-12">
              <div className="w-32 h-32 mb-4">
                <Search className="w-full h-full text-gray-400 opacity-60" />
              </div>
              <h3 className="text-lg font-semibold text-white/90 mb-2">
                No templates found
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-md">
                {hasActiveFilters
                  ? "Try adjusting your search or clearing filters to see more results."
                  : "We don’t have any templates available right now. Please check back soon or contact support."}
              </p>
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    aria-label="Clear Filters"
                    className="px-4 py-2 rounded-lg bg-gold text-black font-medium hover:bg-yellow-500 transition"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => router.refresh()}
                  aria-label="Retry"
                  className="px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-white/10 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Templates);
