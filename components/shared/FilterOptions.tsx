import React, { Dispatch, SetStateAction, useState } from "react";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import { Search } from "@/components/ui/svgs/icons/Search";
import { Star } from "@/components/ui/svgs/icons/Star";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  builtWithOptions,
  setBuiltWithOptions,
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
  setCategories: Dispatch<
    SetStateAction<({ selected: boolean } & ICategory)[]>
  >;
  tags: { tag: string; selected: boolean }[];
  setTags: Dispatch<SetStateAction<{ tag: string; selected: boolean }[]>>;
  builtWithOptions: {
    Icon: ({ className }: { className?: string }) => React.JSX.Element;
    text: string;
    selected: boolean;
  }[];
  setBuiltWithOptions: Dispatch<
    SetStateAction<
      {
        Icon: ({ className }: { className?: string }) => React.JSX.Element;
        text: string;
        selected: boolean;
      }[]
    >
  >;
  minPrice: number;
  maxPrice: number;
  setMinPrice: Dispatch<SetStateAction<number>>;
  setMaxPrice: Dispatch<SetStateAction<number>>;
  minRating: number;
  setMinRating: Dispatch<SetStateAction<number>>;
  sortedBy: "popular" | "recent" | "rating" | "price" | "downloads";
  setSortedBy: Dispatch<
    SetStateAction<"popular" | "recent" | "rating" | "price" | "downloads">
  >;
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
    <div
      className={`w-full flex flex-col gap-4 p-4`}
    >
      <div>
        <h4 className="text-white/60 text-xl font-semibold mb-5">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categories?.map((cat: any, idx) => (
            <button
              key={cat._id}
              type="button"
              aria-pressed={cat.selected}
              className={`py-2 px-3 cursor-pointer ${cat.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/20 text-white/80"} hover:bg-primary transition-colors rounded-md text-sm`}
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
      </div>
      <div>
        <h4 className="text-white/60 text-xl font-semibold mb-5">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tagObj: any, idx) => (
            <span
              key={idx}
              className={`py-2 px-3 cursor-pointer ${tagObj.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/20 text-white/80"} hover:bg-primary transition-colors rounded-md text-sm`}
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
            </span>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-white/60 text-xl font-semibold mb-5">Built With</h4>
        <div className="flex flex-wrap gap-2">
          {builtWithOptions?.map(
            (
              obj: {
                Icon: ({
                  className,
                }: {
                  className: string;
                }) => React.JSX.Element;
                text: string;
                selected: boolean;
              },
              idx,
            ) => (
              <span
                key={idx}
                className={`py-2 px-3 cursor-pointer ${obj.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/20 text-white/80"} hover:bg-primary transition-colors rounded-md text-sm flex items-center gap-2`}
                onClick={() => {
                  const updated = [...builtWithOptions];
                  updated[idx].selected = !updated[idx].selected;
                  setBuiltWithOptions(updated);
                  sendGTMEvent({
                    event: "filter_change",
                    filter_type: "built_with",
                    filter_value: obj.text,
                    is_selected: updated[idx].selected,
                  });
                }}
              >
                <obj.Icon className="w-4 h-4" />
                {obj.text}
              </span>
            ),
          )}
        </div>
      </div>
      <div>
        <h4 className="text-white/60 text-xl font-semibold mb-5">Sort By</h4>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[220px] flex justify-between items-center outline-none border-none hover:bg-primary bg-conic-300 text-white"
            >
              {sortOptions.find((o) => o.value === sortedBy)?.label}
              <ChevronDown className="w-4 h-4" />
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
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <div className="text-white/60 text-xl font-semibold mb-5 flex items-center gap-2">
          Price Range
          <Button
            onClick={() => {
              setMaxPrice(0);
              setMinPrice(0);
              sendGTMEvent({ event: "filter_clear", filter_type: "price" });
            }}
            className="cursor-pointer hover:text-white hover:bg-transparent"
          >
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col justify-center">
            <label
              htmlFor="minPrice"
              className="text-secondary text-xs font-black"
            >
              min.
            </label>
            <Input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={(e) => handlePriceChange("min", e.target.value)}
              placeholder="Min"
              className="w-36 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <span className="text-white/60">-</span>
          <div className="flex flex-col justify-center">
            <label
              htmlFor="maxPrice"
              className="text-secondary text-xs font-black"
            >
              max.
            </label>
            <Input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              placeholder="Max"
              className="w-36 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-white/60 text-xl font-semibold mb-5">
          Minimum Rating
        </h4>
        <div className="flex flex-wrap gap-3 items-center">
          {/* "All Ratings" option */}
          <button
            onClick={() => {
              setMinRating(0);
              sendGTMEvent({
                event: "filter_change",
                filter_type: "rating",
                filter_value: 0,
              });
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                ${minRating === 0 ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
          >
            All Ratings
          </button>

          {/* Star rating options */}
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => {
                setMinRating(rating);
                sendGTMEvent({
                  event: "filter_change",
                  filter_type: "rating",
                  filter_value: rating,
                });
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors
                                    ${minRating === rating ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              {Array.from({ length: rating }).map((_, i) => (
                // <span key={i} className="text-yellow-400">★</span>
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-400"
                  isActive={true}
                />
              ))}
              {rating !== 5 && <span className="text-sm">& up</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterOptions;
