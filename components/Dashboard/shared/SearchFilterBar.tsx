"use client";

import React, { useState } from "react";
import { Search, Filter, X } from "@/components/ui/svgs/Icons";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
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

export default function SearchFilterBar({
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

    const activeFilterCount = Object.keys(activeFilters).filter(
        (key) => activeFilters[key]
    ).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={handleSearchChange}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                    />
                </div>

                {/* Filter Toggle */}
                {filters.length > 0 && (
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 relative"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
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
                                value={activeFilters[filter.key] || "all"}
                                onValueChange={(value) =>
                                    onFilterChange?.(filter.key, value === "all" ? "" : value)
                                }
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder={`Select ${filter.label}`} />
                                </SelectTrigger>
                                <SelectContent className="bg-dark border-white/10">
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
                                </SelectContent>
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
