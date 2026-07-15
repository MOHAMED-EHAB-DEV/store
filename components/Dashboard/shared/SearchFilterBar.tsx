"use client";

import React, { useState, useMemo, memo } from "react";
import { Search } from "@/components/ui/svgs/icons/Search";
import { Filter } from "@/components/ui/svgs/icons/Filter";
import { X } from "@/components/ui/svgs/icons/X";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  onFilterChange?: (key: string, value: string) => void;
  activeFilters?: Record<string, string>;
  onClearFilters?: () => void;
}

function SearchFilterBar({
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  onFilterChange,
  activeFilters = {},
  onClearFilters,
}: SearchFilterBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearchChange(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const activeFilterCount = useMemo(
    () => Object.keys(activeFilters).filter((key) => activeFilters[key]).length,
    [activeFilters],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            startContent={<Search className="w-4 h-4 text-muted-foreground" />}
            isClearable
            onClear={() => {
              setSearchValue("");
              onSearchChange("");
            }}
            classNames={{
              inputWrapper: "bg-white/5 border-white/10 text-white"
            }}
          />
        </div>

        {/* Filter Toggle */}
        {filters.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 relative"
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-primary text-white px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear Filters */}
        {activeFilterCount > 0 && onClearFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-white"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {showFilters && filters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 glass rounded-lg">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {filter.label}
              </label>
              <Select
                selectedKeys={activeFilters[filter.key] ? [activeFilters[filter.key]] : ["all"]}
                onChange={(e) => {
                  const value = e.target.value;
                  onFilterChange?.(filter.key, value === "all" ? "" : value);
                }}
                placeholder={`Select ${filter.label}`}
                classNames={{
                  trigger: "bg-white/5 border-white/10 text-white",
                  popoverContent: "bg-dark border-white/10"
                }}
              >
                <SelectItem value="all">All</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-white hover:bg-white/10"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find((f) => f.key === key);
            const option = filter?.options.find((o) => o.value === value);
            return (
              <Badge
                key={key}
                variant="secondary"
                className="bg-white/10 text-white border-white/20 pr-1"
              >
                {filter?.label}: {option?.label || value}
                <button
                  onClick={() => onFilterChange?.(key, "")}
                  className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(SearchFilterBar);