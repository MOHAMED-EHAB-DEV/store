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
import Template from "@/components/shared/Template";
import TemplateSkeleton from "@/components/ui/TemplateSkeleton";
import TemplateFilters, {
  CategoryWithSelection,
  SortValue,
} from "@/components/shared/TemplateFilters";
import { Search } from "@/components/ui/svgs/icons/Search";
import { cn } from "@/lib/utils";
import { ICategory } from "@/lib/validations/category";
import { ITemplate } from "@/lib/validations/template";

/* ─── SlidersIcon ───────────────────────────────────────────── */
const SlidersIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="8"  cy="6"  r="2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
  </svg>
);

/* ─── Templates ─────────────────────────────────────────────── */
const Templates = ({
  initialData,
  categories,
  searchParams,
  hideCategoryFilter = false,
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

  /* ── Local state ────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState(
    (searchParams.search as string) || "",
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── Sync search query with URL ─────────────────────────── */
  useEffect(() => {
    setSearchQuery((searchParams.search as string) || "");
  }, [searchParams.search]);

  /* ── URL update helper ──────────────────────────────────── */
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

  /* ── Debounced search ───────────────────────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParams.search || "")) {
        updateFilters({ search: searchQuery });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams.search, updateFilters]);

  /* ── Clear all filters ──────────────────────────────────── */
  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
      setSearchQuery("");
    });
  };

  /* ── Derived values ─────────────────────────────────────── */
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

  /** Categories enriched with selection state (single-select) */
  const selectedCategories = useMemo((): CategoryWithSelection[] => {
    const raw = searchParams.categories;
    // Single-select: only the first matching name is considered selected
    const selected =
      typeof raw === "string"
        ? raw.split(",")[0]
        : Array.isArray(raw)
          ? raw[0]?.split(",")[0]
          : "";
    return categories.map((cat) => ({
      ...cat,
      selected: cat.name === selected,
    }));
  }, [categories, searchParams.categories]);

  const minPrice  = Number(searchParams.minPrice)  || 0;
  const maxPrice  = Number(searchParams.maxPrice)  || 0;
  const minRating = Number(searchParams.minRating) || 0;
  const sortedBy  = (searchParams.sortBy as SortValue) || "popular";

  const hasFilterActive =
    selectedCategories.some((c) => c.selected) ||
    minPrice > 0 ||
    maxPrice > 0 ||
    minRating > 0;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Search bar ──────────────────────────────────────── */}
      <div className="relative flex items-center w-full">
        {/* Search icon */}
        <span className="absolute start-3.5 z-10 text-white/40 pointer-events-none" aria-hidden="true">
          <Search className="w-4 h-4" aria-hidden="true" />
        </span>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates by name, description or tags…"
          aria-label="Search templates"
          className={cn(
            "w-full h-12 ps-10 pe-14 rounded-xl text-sm text-white placeholder-white/30",
            "bg-white/[0.04] border border-white/[0.08] outline-none",
            "transition-all duration-200",
            "focus:bg-white/[0.07] focus:border-white/20 focus:ring-2 focus:ring-[var(--gold,#c9a84c)]/30",
          )}
        />

        {/* Right side: spinner + mobile filter toggle (hidden on lg+) */}
        <div className="absolute end-3 flex items-center gap-1.5">
          {isPending && (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--gold,#c9a84c)]" />
          )}
          {/* Toggle button — only visible below lg breakpoint */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            aria-label={mobileFiltersOpen ? "Close filters" : "Open filters"}
            aria-expanded={mobileFiltersOpen}
            className={cn(
              "lg:hidden relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
              mobileFiltersOpen
                ? "bg-[var(--gold,#c9a84c)]/20 text-[var(--gold,#c9a84c)]"
                : "text-white/40 hover:text-white/80 hover:bg-white/10",
            )}
          >
            <SlidersIcon className="w-4 h-4" aria-hidden="true" />
            {/* Active-filter indicator dot */}
            {hasFilterActive && (
              <span aria-hidden="true" className="absolute top-1 end-1 w-1.5 h-1.5 rounded-full bg-[var(--gold,#c9a84c)]" />
            )}
          </button>
        </div>
      </div>

      {/* ── Filters (responsive — see TemplateFilters.tsx) ── */}
      <TemplateFilters
        hideCategoryFilter={hideCategoryFilter}
        categories={selectedCategories}
        onCategoriesChange={(updated) =>
          updateFilters({
            categories: updated.filter((c) => c.selected).map((c) => c.name),
          })
        }
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={(val) => updateFilters({ minPrice: String(val) })}
        onMaxPriceChange={(val) => updateFilters({ maxPrice: String(val) })}
        minRating={minRating}
        onMinRatingChange={(val) => updateFilters({ minRating: String(val) })}
        sortedBy={sortedBy}
        onSortChange={(val) => updateFilters({ sortBy: val })}
        onClearAll={clearFilters}
        mobileOpen={mobileFiltersOpen}
        onMobileOpenChange={setMobileFiltersOpen}
      />

      {/* ── Results grid ─────────────────────────────────────── */}
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
              <Template key={template._id} template={template} mode="store" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-32 h-32 mb-4" aria-hidden="true">
              <Search className="w-full h-full text-gray-400 opacity-60" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">
              No templates found
            </h3>
            <p className="text-sm text-gray-400 mb-4 max-w-md">
              {hasActiveFilters
                ? "Try adjusting your search or clearing filters to see more results."
                : "We don't have any templates available right now. Please check back soon or contact support."}
            </p>
            <div className="flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  aria-label="Clear Filters"
                  className="px-4 py-2 rounded-lg bg-[var(--gold,#c9a84c)] text-black font-medium hover:brightness-110 transition"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => router.refresh()}
                aria-label="Retry"
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/10 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default memo(Templates);
