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

const FilterOptions = ({
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
}) => {
  const handlePriceChange = (type: "min" | "max", value: string) => {
    let num = Number(value);

    if (isNaN(num) || num < 0) num = 0;

    if (type === "min") {
      if (num > maxPrice) {
        return sonnerToast.error("Min. Price must be less than Max. Price");
      }
      setMinPrice(num);
    } else {
      if (num < minPrice) {
        return sonnerToast.error("Max. Price must be more than Min. Price");
      }
      setMaxPrice(num);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-4 p-4`}>
      {categories.length > 0 && (
        <fieldset className="border-none p-0 m-0">
          <legend className="text-white/60 text-xl font-semibold mb-5">
            Categories
          </legend>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by Categories"
          >
            {categories?.map((cat: any, idx) => (
              <button
                key={cat._id}
                type="button"
                aria-pressed={cat.selected}
                className={`py-2 px-3 cursor-pointer ${cat.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/20 text-white/80"} hover:bg-primary transition-colors rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                onClick={() => {
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
              >
                {cat.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {tags.length > 0 && (
        <fieldset className="border-none p-0 m-0">
          <legend className="text-white/60 text-xl font-semibold mb-5">
            Tags
          </legend>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by Tags"
          >
            {tags?.map((tagObj: any, idx) => (
              <button
                key={idx}
                type="button"
                aria-pressed={tagObj.selected}
                className={`py-2 px-3 cursor-pointer ${tagObj.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/20 text-white/80"} hover:bg-primary transition-colors rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                onClick={() => {
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
              >
                {tagObj.tag}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2">
        <label
          id="sort-by-label"
          className="text-white/60 text-xl font-semibold mb-3"
        >
          Sort By
        </label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-labelledby="sort-by-label"
              className="min-w-[220px] flex justify-between items-center outline-none border-none hover:bg-primary bg-conic-300 text-white focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {sortOptions.find((o) => o.value === sortedBy)?.label}
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[220px] p-0 bg-dark">
            <Command>
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
                    className="cursor-pointer flex items-center gap-2 py-2"
                  >
                    <span aria-hidden="true">{option.icon}</span>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <fieldset className="border-none p-0 m-0">
        <legend className="text-white/60 text-xl font-semibold mb-5 flex items-center gap-2">
          Price Range
          <Button
            type="button"
            onClick={() => {
              setMaxPrice(0);
              setMinPrice(0);
              sendGTMEvent({ event: "filter_clear", filter_type: "price" });
            }}
            className="cursor-pointer hover:text-white hover:bg-transparent h-auto p-1 py-0 text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Reset price range"
          >
            Reset
          </Button>
        </legend>
        <div className="flex items-center gap-2">
          <div className="flex flex-col justify-center">
            <label
              htmlFor="minPrice"
              className="text-secondary text-xs font-black mb-1"
            >
              min.
            </label>
            <Input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={(e) => handlePriceChange("min", e.target.value)}
              placeholder="Min"
              aria-label="Minimum Price"
              className="w-36 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <span className="text-white/60" aria-hidden="true">
            -
          </span>
          <div className="flex flex-col justify-center">
            <label
              htmlFor="maxPrice"
              className="text-secondary text-xs font-black mb-1"
            >
              max.
            </label>
            <Input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              placeholder="Max"
              aria-label="Maximum Price"
              className="w-36 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </fieldset>
      <fieldset className="border-none p-0 m-0">
        <legend className="text-white/60 text-xl font-semibold mb-5">
          Minimum Rating
        </legend>
        <div
          className="flex flex-wrap gap-3 items-center"
          role="group"
          aria-label="Filter by Minimum Rating"
        >
          {/* "All Ratings" option */}
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
            aria-pressed={minRating === 0}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                ${minRating === 0 ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
          >
            All Ratings
          </button>

          {/* Star rating options */}
          {[1, 2, 3, 4, 5].map((rating) => (
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
              aria-pressed={minRating === rating}
              aria-label={`${rating} star${rating > 1 ? "s" : ""} and up`}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                    ${minRating === rating ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              {Array.from({ length: rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-400"
                  isActive={true}
                  aria-hidden="true"
                />
              ))}
              {rating !== 5 && (
                <span className="text-sm" aria-hidden="true">
                  & up
                </span>
              )}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default FilterOptions;
