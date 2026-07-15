import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { Star } from "@/components/ui/svgs/icons/Star";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { sonnerToast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { ICategory } from "@/types";
import { sendGTMEvent } from "@next/third-parties/google";

const sortOptions: {
  value: "popular" | "recent" | "rating" | "price" | "downloads";
  label: string;
  icon: string;
}[] = [
  { value: "popular", label: "Most Popular", icon: "🔥" },
  { value: "recent", label: "Newest", icon: "🆕" },
  { value: "rating", label: "Highest Rating", icon: "⭐" },
  { value: "price", label: "Price", icon: "💲" },
  { value: "downloads", label: "Most Downloads", icon: "⬇️" },
];

const FilterBar = ({
  categories,
  setCategories,
  tags,
  setTags,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  sortedBy,
  setSortedBy,
  hideCategoryFilter = false,
  clearFilters,
}: {
  categories: ({ selected: boolean } & ICategory)[];
  setCategories: (updated: ({ selected: boolean } & ICategory)[]) => void;
  tags: { tag: string; selected: boolean }[];
  setTags: (updated: { tag: string; selected: boolean }[]) => void;

  minPrice: number;
  maxPrice: number;
  setMinPrice: (val: number) => void;
  setMaxPrice: (val: number) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  sortedBy: "popular" | "recent" | "rating" | "price" | "downloads";
  setSortedBy: (
    val: "popular" | "recent" | "rating" | "price" | "downloads",
  ) => void;
  hideCategoryFilter?: boolean;
  clearFilters: () => void;
}) => {
  const handlePriceChange = (type: "min" | "max", value: string) => {
    let num = Number(value);

    if (isNaN(num) || num < 0) num = 0;

    if (type === "min") {
      if (num > maxPrice && maxPrice !== 0) {
        return sonnerToast.error("Min. Price must be less than Max. Price");
      }
      setMinPrice(num);
    } else {
      if (num < minPrice && num !== 0) {
        return sonnerToast.error("Max. Price must be more than Min. Price");
      }
      setMaxPrice(num);
    }
  };

  const selectedCategoriesCount = categories.filter((c) => c.selected).length;
  const selectedTagsCount = tags.filter((t) => t.selected).length;

  const hasActiveFilters =
    selectedCategoriesCount > 0 ||
    selectedTagsCount > 0 ||
    minPrice > 0 ||
    maxPrice > 0 ||
    minRating > 0;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {!hideCategoryFilter && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2"
              >
                Categories
                {selectedCategoriesCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedCategoriesCount}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-white/50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-dark border-white/10">
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {categories?.map((cat: any, idx) => (
                  <label
                    key={cat._id}
                    className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={cat.selected}
                      onChange={() => {
                        const updated = [...categories];
                        updated[idx].selected = !updated[idx].selected;
                        setCategories(updated);
                        sendGTMEvent({
                          event: "filter_change",
                          filter_type: "category",
                          filter_value: cat.name,
                          is_selected: updated[idx].selected,
                        });
                      }}
                      className="rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {tags.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2"
              >
                Tags
                {selectedTagsCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedTagsCount}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-white/50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-dark border-white/10">
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {tags?.map((tagObj: any, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={tagObj.selected}
                      onChange={() => {
                        const updated = [...tags];
                        updated[idx].selected = !updated[idx].selected;
                        setTags(updated);
                        sendGTMEvent({
                          event: "filter_change",
                          filter_type: "tag",
                          filter_value: tagObj.tag,
                          is_selected: updated[idx].selected,
                        });
                      }}
                      className="rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm">{tagObj.tag}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2"
            >
              Price
              {(minPrice > 0 || maxPrice > 0) && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
              <ChevronDown className="w-4 h-4 text-white/50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 bg-dark border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm font-medium">
                  Price Range
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMaxPrice(0);
                    setMinPrice(0);
                    sendGTMEvent({
                      event: "filter_clear",
                      filter_type: "price",
                    });
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    label="Min"
                    type="number"
                    value={minPrice || ""}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    placeholder="0"
                    classNames={{
                      label: "text-xs text-white/50 uppercase tracking-wider",
                      inputWrapper: "bg-white/5 border-white/10 text-white focus-within:ring-blue-500"
                    }}
                  />
                </div>
                <span className="text-white/30 pt-4">-</span>
                <div className="flex-1">
                  <Input
                    label="Max"
                    type="number"
                    value={maxPrice || ""}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    placeholder="Any"
                    classNames={{
                      label: "text-xs text-white/50 uppercase tracking-wider",
                      inputWrapper: "bg-white/5 border-white/10 text-white focus-within:ring-blue-500"
                    }}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2"
            >
              Rating
              {minRating > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {minRating}+
                </span>
              )}
              <ChevronDown className="w-4 h-4 text-white/50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4 bg-dark border-white/10">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMinRating(0);
                  sendGTMEvent({
                    event: "filter_change",
                    filter_type: "rating",
                    filter_value: 0,
                  });
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${minRating === 0 ? "bg-blue-500/20 text-blue-400" : "text-white/70 hover:bg-white/10"}`}
              >
                All Ratings
                {minRating === 0 && <span className="text-blue-400">✓</span>}
              </button>
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    setMinRating(rating);
                    sendGTMEvent({
                      event: "filter_change",
                      filter_type: "rating",
                      filter_value: rating,
                    });
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${minRating === rating ? "bg-blue-500/20 text-blue-400" : "text-white/70 hover:bg-white/10"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`}
                        />
                      ))}
                    </div>
                    <span>& up</span>
                  </div>
                  {minRating === rating && (
                    <span className="text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2"
            >
              Sort by: {sortOptions.find((o) => o.value === sortedBy)?.label}
              <ChevronDown className="w-4 h-4 text-white/50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-dark border-white/10">
            <Command className="bg-transparent">
              <CommandGroup>
                {sortOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      setSortedBy(option.value);
                      sendGTMEvent({
                        event: "sort_change",
                        sort_value: option.value,
                      });
                    }}
                    className="cursor-pointer flex items-center justify-between gap-2 py-2 text-white/80 aria-selected:bg-white/10 aria-selected:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                    {sortedBy === option.value && (
                      <span className="text-blue-400">✓</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-white/50 hover:text-white hover:bg-transparent px-2"
          >
            Clear All
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {categories
            .filter((c) => c.selected)
            .map((cat, idx) => (
              <span
                key={cat._id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm"
              >
                {cat.name}
                <button
                  onClick={() => {
                    const updated = [...categories];
                    const targetIdx = updated.findIndex(
                      (c) => c._id === cat._id,
                    );
                    updated[targetIdx].selected = false;
                    setCategories(updated);
                  }}
                  className="hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            ))}
          {tags
            .filter((t) => t.selected)
            .map((tagObj, idx) => (
              <span
                key={tagObj.tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm"
              >
                {tagObj.tag}
                <button
                  onClick={() => {
                    const updated = [...tags];
                    const targetIdx = updated.findIndex(
                      (t) => t.tag === tagObj.tag,
                    );
                    updated[targetIdx].selected = false;
                    setTags(updated);
                  }}
                  className="hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            ))}
          {(minPrice > 0 || maxPrice > 0) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
              {minPrice > 0 ? `$${minPrice}` : "$0"} -{" "}
              {maxPrice > 0 ? `$${maxPrice}` : "Any"}
              <button
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(0);
                }}
                className="hover:text-blue-300"
              >
                ×
              </button>
            </span>
          )}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
              {minRating}+ Stars
              <button
                onClick={() => setMinRating(0)}
                className="hover:text-blue-300"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
