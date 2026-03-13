"use client";

import { memo, useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import FilterOptions from "@/components/shared/FilterOptions";
import Template from "@/components/shared/Template";
import TemplateSkeleton from "@/components/ui/TemplateSkeleton";
import { Search } from "@/components/ui/svgs/icons/Search";
import { ICategory, ITemplate } from "@/types";
import { builtWithOptions } from "@/constants";

const Templates = ({
  initialData,
  categories,
  searchParams,
}: {
  initialData: ITemplate[];
  categories: ICategory[];
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState((searchParams.search as string) || "");

  // Update search query state when URL changes externally
  useEffect(() => {
    setSearchQuery((searchParams.search as string) || "");
  }, [searchParams.search]);

  const updateFilters = useCallback((newParams: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0) || value === "0") {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [currentSearchParams, pathname, router]);

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
    return keys.length > 0 && keys.some(k => searchParams[k] !== undefined && searchParams[k] !== "" && searchParams[k] !== "0");
  }, [searchParams]);

  const selectedCategories = useMemo(() => {
    const selected = Array.isArray(searchParams.categories) ? searchParams.categories : [searchParams.categories].filter(Boolean) as string[];
    return categories.map(cat => ({
      ...cat,
      selected: selected.includes(cat.name)
    }));
  }, [categories, searchParams.categories]);

  const allTags = useMemo(() => Array.from(new Set(initialData.flatMap((t) => t.tags))), [initialData]);
  const selectedTags = useMemo(() => {
    const selected = Array.isArray(searchParams.tags) ? searchParams.tags : [searchParams.tags].filter(Boolean) as string[];
    return allTags.map(tag => ({
      tag,
      selected: selected.includes(tag)
    }));
  }, [allTags, searchParams.tags]);

  const selectedBuiltWithOptions = useMemo(() => {
    const selected = Array.isArray(searchParams.builtWith) ? searchParams.builtWith : [searchParams.builtWith].filter(Boolean) as string[];
    return builtWithOptions.map(opt => ({
      ...opt,
      selected: selected.includes(opt.text.toLowerCase())
    }));
  }, [searchParams.builtWith]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full flex-1">
        <Search className="absolute left-4 z-20 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
          placeholder="Search..."
        />
        {isPending && (
           <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold" />
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[30%_1fr] gap-4">
        <FilterOptions
          categories={selectedCategories}
          setCategories={(updated) => {
             const selected = (updated as any[]).filter(c => c.selected).map(c => c.name);
             updateFilters({ categories: selected });
          }}
          tags={selectedTags}
          setTags={(updated) => {
            const selected = (updated as any[]).filter(t => t.selected).map(t => t.tag);
            updateFilters({ tags: selected });
          }}
          builtWithOptions={selectedBuiltWithOptions}
          setBuiltWithOptions={(updated) => {
            const selected = (updated as any[]).filter(b => b.selected).map(b => b.text.toLowerCase());
            updateFilters({ builtWith: selected });
          }}
          minPrice={Number(searchParams.minPrice) || 0}
          maxPrice={Number(searchParams.maxPrice) || 0}
          setMinPrice={(val) => updateFilters({ minPrice: String(val) })}
          setMaxPrice={(val) => updateFilters({ maxPrice: String(val) })}
          minRating={Number(searchParams.minRating) || 0}
          setMinRating={(val) => updateFilters({ minRating: String(val) })}
          sortedBy={(searchParams.sortBy as any) || "popular"}
          setSortedBy={(val) => updateFilters({ sortBy: val })}
        />
        
        <div className="flex flex-col gap-6">
          {isPending ? (
            <div className="flex items-center justify-center flex-wrap gap-6">
              {[...Array(6)].map((_, idx) => (
                <TemplateSkeleton key={idx} />
              ))}
            </div>
          ) : initialData.length > 0 ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-5`}>
              {initialData.map((template) => (
                <Template
                  showActionButtons={true}
                  showPrice={true}
                  key={template._id}
                  template={template}
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
                  onClick={() => window.location.reload()}
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

