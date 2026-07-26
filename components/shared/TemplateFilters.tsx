"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { Check } from "@/components/ui/svgs/icons/Check";
import { X } from "@/components/ui/svgs/icons/X";
import { Star } from "@/components/ui/svgs/icons/Star";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { sonnerToast } from "@/components/ui/sonner";
import { sendGTMEvent } from "@next/third-parties/google";
import { cn } from "@/lib/utils";
import { ICategory } from "@/lib/validations/category";

/* ─── Types ─────────────────────────────────────────────────── */

export type SortValue = "popular" | "recent" | "rating" | "price" | "downloads";

export type CategoryWithSelection = { selected: boolean } & ICategory;

export interface TemplateFiltersProps {
  /** Whether to hide the categories filter entirely */
  hideCategoryFilter?: boolean;

  categories: CategoryWithSelection[];
  onCategoriesChange: (updated: CategoryWithSelection[]) => void;

  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (val: number) => void;
  onMaxPriceChange: (val: number) => void;

  minRating: number;
  onMinRatingChange: (val: number) => void;

  sortedBy: SortValue;
  onSortChange: (val: SortValue) => void;

  onClearAll: () => void;

  /** Controlled open state for the mobile toggle panel */
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

/* ─── Constants ─────────────────────────────────────────────── */

const SORT_OPTIONS: { value: SortValue; label: string; icon: string }[] = [
  { value: "popular",   label: "Most Popular",   icon: "🔥" },
  { value: "recent",    label: "Newest",          icon: "🆕" },
  { value: "rating",    label: "Highest Rating",  icon: "⭐" },
  { value: "price",     label: "Price",           icon: "💲" },
  { value: "downloads", label: "Most Downloads",  icon: "⬇️" },
];

/* ─── Sub-components ─────────────────────────────────────────── */

/** Tiny uppercase label above each filter control */
const FilterLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1.5 ps-0.5 select-none">
    {children}
  </span>
);

/** Inline X badge that clears a specific filter on click */
const ClearBadge = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <span
    role="button"
    tabIndex={0}
    onClick={onClick}
    className="hover:bg-white/20 p-0.5 rounded-full transition-colors text-white/70 hover:text-white"
  >
    <X className="w-3 h-3" />
  </span>
);

/* ─── Filter Controls ────────────────────────────────────────── */

/** Categories popover */
const CategoriesFilter = ({
  categories,
  onCategoriesChange,
}: Pick<TemplateFiltersProps, "categories" | "onCategoriesChange">) => {
  const selected = categories.find((c) => c.selected);

  return (
    <div className="flex flex-col">
      <FilterLabel>Categories</FilterLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white h-10 px-3 text-sm font-normal"
          >
            <span className="truncate text-start">
              {selected ? selected.name : "All categories"}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {selected && (
                <ClearBadge
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoriesChange(categories.map((c) => ({ ...c, selected: false })));
                    sendGTMEvent({ event: "filter_clear", filter_type: "category" });
                  }}
                />
              )}
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-1.5 bg-[#18181b] border-white/10 rounded-2xl">
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
            {categories.map((cat, idx) => (
              <div
                key={cat._id}
                onClick={() => {
                  // Single-select: selecting a new category deselects all others.
                  // Clicking the active category deselects it.
                  const isCurrentlySelected = cat.selected;
                  const updated = categories.map((c, i) => ({
                    ...c,
                    selected: i === idx ? !isCurrentlySelected : false,
                  }));
                  onCategoriesChange(updated);
                  sendGTMEvent({
                    event: "filter_change",
                    filter_type: "category",
                    filter_value: cat.name,
                    is_selected: !isCurrentlySelected,
                  });
                }}
                className={cn(
                  "flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-sm cursor-pointer select-none transition-colors",
                  cat.selected
                    ? "text-white font-medium hover:bg-white/10"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="truncate">{cat.name}</span>
                {cat.selected && <Check className="w-4 h-4 text-white shrink-0 ms-auto" />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/** Price range popover */
const PriceFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: Pick<TemplateFiltersProps, "minPrice" | "maxPrice" | "onMinPriceChange" | "onMaxPriceChange">) => {
  const hasPrice = minPrice > 0 || maxPrice > 0;

  const handleChange = (type: "min" | "max", raw: string) => {
    let num = Number(raw);
    if (isNaN(num) || num < 0) num = 0;

    if (type === "min") {
      if (num > maxPrice && maxPrice !== 0)
        return sonnerToast.error("Min. Price must be less than Max. Price");
      onMinPriceChange(num);
    } else {
      if (num < minPrice && num !== 0)
        return sonnerToast.error("Max. Price must be more than Min. Price");
      onMaxPriceChange(num);
    }
  };

  const clearPrice = () => {
    onMinPriceChange(0);
    onMaxPriceChange(0);
    sendGTMEvent({ event: "filter_clear", filter_type: "price" });
  };

  return (
    <div className="flex flex-col">
      <FilterLabel>Price Range</FilterLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white h-10 px-3 text-sm font-normal"
          >
            <span className="truncate text-start">
              {hasPrice
                ? `$${minPrice || 0} – ${maxPrice > 0 ? `$${maxPrice}` : "Any"}`
                : "Any price"}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {hasPrice && (
                <ClearBadge onClick={(e) => { e.stopPropagation(); clearPrice(); }} />
              )}
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4 bg-[#18181b] border-white/10 rounded-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm font-medium">Price Range</span>
              <button
                type="button"
                onClick={clearPrice}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  label="Min ($)"
                  type="number"
                  value={minPrice || ""}
                  onChange={(e) => handleChange("min", e.target.value)}
                  placeholder="0"
                  classNames={{
                    label: "text-xs text-white/50 uppercase tracking-wider",
                    inputWrapper: "bg-white/5 border-white/10 text-white focus-within:ring-[var(--gold,#c9a84c)]",
                  }}
                />
              </div>
              <span className="text-white/40 pt-5 shrink-0">–</span>
              <div className="flex-1">
                <Input
                  label="Max ($)"
                  type="number"
                  value={maxPrice || ""}
                  onChange={(e) => handleChange("max", e.target.value)}
                  placeholder="Any"
                  classNames={{
                    label: "text-xs text-white/50 uppercase tracking-wider",
                    inputWrapper: "bg-white/5 border-white/10 text-white focus-within:ring-[var(--gold,#c9a84c)]",
                  }}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/** Min rating popover */
const RatingFilter = ({
  minRating,
  onMinRatingChange,
}: Pick<TemplateFiltersProps, "minRating" | "onMinRatingChange">) => {
  const StarRow = ({ count }: { count: number }) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("w-3 h-3", i < count ? "text-yellow-400 fill-yellow-400" : "text-white/20")}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col">
      <FilterLabel>Min Rating</FilterLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white h-10 px-3 text-sm font-normal"
          >
            <span className="truncate text-start">
              {minRating > 0 ? (
                <span className="flex items-center gap-1.5">
                  <StarRow count={minRating} />
                  <span className="text-white/70">& up</span>
                </span>
              ) : (
                "All ratings"
              )}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {minRating > 0 && (
                <ClearBadge
                  onClick={(e) => {
                    e.stopPropagation();
                    onMinRatingChange(0);
                    sendGTMEvent({ event: "filter_clear", filter_type: "rating" });
                  }}
                />
              )}
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5 bg-[#18181b] border-white/10 rounded-2xl">
          <div className="flex flex-col gap-0.5">
            {/* "All ratings" option */}
            <button
              type="button"
              onClick={() => {
                onMinRatingChange(0);
                sendGTMEvent({ event: "filter_change", filter_type: "rating", filter_value: 0 });
              }}
              className={cn(
                "flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                minRating === 0
                  ? "text-white font-medium hover:bg-white/10"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              All Ratings
              {minRating === 0 && <Check className="w-4 h-4 text-white shrink-0 ms-auto" />}
            </button>

            {/* 4★, 3★, 2★, 1★ & up */}
            {[4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => {
                  onMinRatingChange(rating);
                  sendGTMEvent({ event: "filter_change", filter_type: "rating", filter_value: rating });
                }}
                className={cn(
                  "flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                  minRating === rating
                    ? "text-white font-medium hover:bg-white/10"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <div className="flex items-center gap-2">
                  <StarRow count={rating} />
                  <span>& up</span>
                </div>
                {minRating === rating && <Check className="w-4 h-4 text-white shrink-0 ms-auto" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/** Sort-by popover */
const SortFilter = ({
  sortedBy,
  onSortChange,
}: Pick<TemplateFiltersProps, "sortedBy" | "onSortChange">) => {
  const active = SORT_OPTIONS.find((o) => o.value === sortedBy);

  return (
    <div className="flex flex-col">
      <FilterLabel>Sort By</FilterLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white h-10 px-3 text-sm font-normal"
          >
            <span className="truncate text-start">
              {active?.icon} {active?.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5 bg-[#18181b] border-white/10 rounded-2xl">
          <Command className="bg-transparent">
            <CommandGroup>
              {SORT_OPTIONS.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onSortChange(option.value);
                    sendGTMEvent({ event: "sort_change", sort_value: option.value });
                  }}
                  className="cursor-pointer flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-white/80 aria-selected:bg-white/10 aria-selected:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                  {sortedBy === option.value && (
                    <Check className="w-4 h-4 text-white shrink-0 ms-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/* ─── FilterGrid ─────────────────────────────────────────────── */
/**
 * Shared grid of all 4 (or 3) filter controls.
 * Used both by the always-visible desktop row and the collapsible mobile panel.
 */
const FilterGrid = ({
  hideCategoryFilter,
  categories,
  onCategoriesChange,
  minPrice, maxPrice, onMinPriceChange, onMaxPriceChange,
  minRating, onMinRatingChange,
  sortedBy, onSortChange,
}: Omit<TemplateFiltersProps, "mobileOpen" | "onMobileOpenChange">) => {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "grid gap-x-4 gap-y-5",
          hideCategoryFilter ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {!hideCategoryFilter && (
          <CategoriesFilter categories={categories} onCategoriesChange={onCategoriesChange} />
        )}
        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={onMinPriceChange}
          onMaxPriceChange={onMaxPriceChange}
        />
        <RatingFilter minRating={minRating} onMinRatingChange={onMinRatingChange} />
        <SortFilter sortedBy={sortedBy} onSortChange={onSortChange} />
      </div>
    </div>
  );
};

/* ─── TemplateFilters ────────────────────────────────────────── */
/**
 * Responsive filter bar:
 * - **lg+** (desktop & large tablets): always-visible inline filter row
 * - **< lg** (mobile & small-moderate tablets): collapsible panel, toggled
 *   by the sliders button in the search bar (controlled via mobileOpen prop)
 */
const TemplateFilters = (props: TemplateFiltersProps) => {
  const { mobileOpen, onMobileOpenChange, ...filterProps } = props;

  const hasFilterActive =
    props.categories.some((c) => c.selected) ||
    props.minPrice > 0 ||
    props.maxPrice > 0 ||
    props.minRating > 0;

  return (
    <>
      {/* ── Desktop / large-tablet: always visible ────────── */}
      <div className="hidden lg:block pb-4 border-b border-white/[0.06]">
        <FilterGrid {...filterProps} />
      </div>

      {/* ── Mobile / small-tablet: collapsible panel ──────── */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5">
          <FilterGrid {...filterProps} />
        </div>
      </div>

      {/* ── Active filter chips (shown on all breakpoints) ── */}
      {hasFilterActive && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Category chips */}
          {props.categories
            .filter((c) => c.selected)
            .map((cat) => (
              <span
                key={cat._id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs"
              >
                {cat.name}
                <button
                  onClick={() =>
                    props.onCategoriesChange(
                      props.categories.map((c) =>
                        c._id === cat._id ? { ...c, selected: false } : c,
                      ),
                    )
                  }
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

          {/* Price chip */}
          {(props.minPrice > 0 || props.maxPrice > 0) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs">
              ${props.minPrice || 0} –{" "}
              {props.maxPrice > 0 ? `$${props.maxPrice}` : "Any"}
              <button
                onClick={() => {
                  props.onMinPriceChange(0);
                  props.onMaxPriceChange(0);
                }}
                className="hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Rating chip */}
          {props.minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs">
              {props.minRating}★ & up
              <button
                onClick={() => props.onMinRatingChange(0)}
                className="hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Clear all */}
          <button
            type="button"
            onClick={props.onClearAll}
            className="ms-1 items-end text-xs text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </>
  );
};

export default TemplateFilters;
