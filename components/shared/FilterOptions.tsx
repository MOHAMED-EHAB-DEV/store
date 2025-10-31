import React, {Dispatch, SetStateAction, useState} from "react";
import {ChevronDown, ChevronUp, Search, Star} from "@/components/ui/svgs/Icons";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
    Command,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import {sonnerToast} from "@/components/ui/sonner";
import {Input} from "@/components/ui/input";

const sortOptions: { value: "popular" | "recent" | "rating" | "price" | "downloads"; label: string; icon: string }[] = [
    {value: "popular", label: "Most Popular", icon: "🔥"},
    {value: "recent", label: "Newest", icon: "🆕"},
    {value: "rating", label: "Highest Rating", icon: "⭐"},
    {value: "price", label: "Price", icon: "💲"},
    {value: "downloads", label: "Most Downloads", icon: "⬇️"},
];

const FilterOptions = (
    {
        search,
        setSearch,
        isHome = false,
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
        search: string;
        setSearch: Dispatch<SetStateAction<string>>;
        isHome: Boolean;
        categories: ICategory[];
        setCategories: Dispatch<SetStateAction<ICategory[]>>;
        tags: { tag: string; selected: boolean }[];
        setTags: Dispatch<SetStateAction<{ tag: string; selected: boolean }[]>>;
        builtWithOptions: {
            Icon: ({className}: { className: string }) => React.JSX.Element,
            text: string,
            selected: boolean
        }[];
        setBuiltWithOptions: Dispatch<SetStateAction<{
            Icon: ({className}: { className: string }) => React.JSX.Element,
            text: string,
            selected: boolean
        }[]>>;
        minPrice: number;
        maxPrice: number;
        setMinPrice: Dispatch<SetStateAction<number>>;
        setMaxPrice: Dispatch<SetStateAction<number>>;
        minRating: number;
        setMinRating: Dispatch<SetStateAction<number>>;
        sortedBy: string;
        setSortedBy: Dispatch<SetStateAction<String>>;
    }) => {
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const [isSortByOpen, setIsSortByOpen] = useState(false);

    const handleSelectAll = <T extends { selected: boolean }>(
        setter: Dispatch<SetStateAction<T[]>>,
        list: T[]
    ) => {
        setter(list.map((item) => ({...item, selected: true})));
    };

    const handleClearAll = <T extends { selected: boolean }>(
        setter: Dispatch<SetStateAction<T[]>>,
        list: T[]
    ) => {
        setter(list.map((item) => ({...item, selected: false})));
    };

    const handleClearPriceRange = () => {
        setMaxPrice(0);
        setMinPrice(0);
    }

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
        <div className={`w-full flex flex-col ${isHome ? "gap-4 p-4" : "gap-3 items-center"}`}>
            {isHome ? (
                <>
                    <div>
                        <h4 className="text-white/60 text-xl font-semibold mb-5">
                            Categories
                        </h4>
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
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white/60 text-xl font-semibold mb-5">
                            Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {tags?.map((tagObj: any, idx) => (
                                <span
                                    key={idx}
                                    className={`py-2 px-3 cursor-pointer ${tagObj.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/20 text-white/80"} hover:bg-primary transition-colors rounded-md text-sm`}
                                    onClick={() => {
                                        const updated = [...tags];
                                        updated[idx].selected = !updated[idx].selected;
                                        setTags(updated);
                                    }}
                                >
                            {tagObj.tag}
                        </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white/60 text-xl font-semibold mb-5">
                            Built With
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {builtWithOptions?.map((obj: {
                                Icon: ({className}: { className: string }) => React.JSX.Element,
                                text: string,
                                selected: boolean
                            }, idx) => (
                                <span
                                    key={idx}
                                    className={`py-2 px-3 cursor-pointer ${obj.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/20 text-white/80"} hover:bg-primary transition-colors rounded-md text-sm flex items-center gap-2`}
                                    onClick={() => {
                                        const updated = [...builtWithOptions];
                                        updated[idx].selected = !updated[idx].selected;
                                        setBuiltWithOptions(updated);
                                    }}
                                >
                                    <obj.Icon className="w-4 h-4"/>
                                    {obj.text}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white/60 text-xl font-semibold mb-5">
                            Sort By
                        </h4>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="min-w-[220px] flex justify-between items-center outline-none border-none hover:bg-primary bg-conic-300 text-white"
                                >
                                    {sortOptions.find((o) => o.value === sortedBy)?.label}
                                    <ChevronDown className="w-4 h-4"/>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[220px] p-0 bg-dark">
                                <Command>
                                    <CommandGroup>
                                        {sortOptions.map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                onSelect={() => setSortedBy(option.value)}
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
                                }}
                                className="cursor-pointer hover:text-white hover:bg-transparent"
                            >Reset</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col justify-center">
                                <label htmlFor="minPrice"
                                       className="text-secondary text-xs font-black">min.</label>
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
                                <label htmlFor="maxPrice"
                                       className="text-secondary text-xs font-black">max.</label>
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
                                onClick={() => setMinRating(0)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                ${minRating === 0 ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                            >
                                All Ratings
                            </button>

                            {/* Star rating options */}
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setMinRating(rating)}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors
                                    ${minRating === rating ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                                >
                                    {Array.from({length: rating}).map((_, i) => (
                                        // <span key={i} className="text-yellow-400">★</span>
                                        <Star key={i} className="w-4 h-4 text-yellow-400" isActive={true}/>
                                    ))}
                                    {rating !== 5 && <span className="text-sm">& up</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="relative w-full flex-1 min-w-[250px]">
                        <Search
                            className="absolute left-4 z-20 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                            placeholder="Search..."
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:flex md:flex-row md:space-x-4 md:gap-0">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                        className="min-w-[180px] focus:bg-primary hover:bg-primary flex gap-2 items-center bg-conic-300 text-white">
                                    {categories.filter(c => c.selected).length > 0
                                        ? `${categories.filter(c => c.selected).length} Category(s)`
                                        : "Categories"}
                                    {isCategoriesOpen ? <ChevronUp/> : <ChevronDown/>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0 bg-dark">
                                <div className="p-2 flex justify-between border-b border-border">
                                    <Button size="sm" variant="ghost"
                                            onClick={() => handleSelectAll(setCategories, categories)}
                                            className="text-xs">Select All</Button>
                                    <Button size="sm" variant="ghost"
                                            onClick={() => handleClearAll(setCategories, categories)}
                                            className="text-xs text-red-500 hover:bg-red-500 hover:text-white">Clear</Button>
                                </div>
                                <Command className="max-h-[200px] overflow-auto">
                                    <CommandGroup>
                                        {categories.map((cat, idx) => (
                                            <CommandItem key={cat._id} onSelect={() => {
                                                const updated = [...categories];
                                                updated[idx].selected = !updated[idx].selected;
                                                setCategories(updated);
                                            }} className="gap-2">
                                                <Checkbox checked={cat.selected}/>
                                                <span className="capitalize">{cat.name}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                        className="min-w-[180px] focus:bg-primary hover:bg-primary flex gap-2 items-center bg-conic-300 text-white">
                                    {tags.filter(t => t.selected).length > 0
                                        ? `${tags.filter(t => t.selected).length} Tag(s)`
                                        : "Tags"}
                                    {isTagsOpen ? <ChevronUp/> : <ChevronDown/>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0 bg-dark">
                                <div className="p-2 flex justify-between border-b border-border">
                                    <Button size="sm" variant="ghost" onClick={() => handleSelectAll(setTags, tags)}
                                            className="text-xs">Select All</Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleClearAll(setTags, tags)}
                                            className="text-xs text-red-500 hover:bg-red-500 hover:text-white">Clear</Button>
                                </div>
                                <Command className="max-h-[200px] overflow-auto">
                                    <CommandGroup>
                                        {tags.map((tag, idx) => (
                                            <CommandItem key={tag.tag} onSelect={() => {
                                                const updated = [...tags];
                                                updated[idx].selected = !updated[idx].selected;
                                                setTags(updated);
                                            }} className="gap-2">
                                                <Checkbox checked={tag.selected}/>
                                                <span className="capitalize">{tag.tag}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                        className="min-w-[180px] focus:bg-primary hover:bg-primary flex gap-2 items-center bg-conic-300 text-white">
                                    Built With
                                    <ChevronDown className="w-4 h-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-2 bg-dark">
                                <div className="p-2 flex justify-between border-b border-border mb-2">
                                    <Button size="sm" variant="ghost"
                                            onClick={() => handleSelectAll(setBuiltWithOptions, builtWithOptions)}
                                            className="text-xs">Select All</Button>
                                    <Button size="sm" variant="ghost"
                                            onClick={() => handleClearAll(setBuiltWithOptions, builtWithOptions)}
                                            className="text-xs text-red-500 hover:bg-red-500 hover:text-white">Clear</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {builtWithOptions?.map((bw, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const updated = [...builtWithOptions];
                                                updated[idx].selected = !updated[idx].selected;
                                                setBuiltWithOptions(updated);
                                            }}
                                            className={`px-3 py-2 rounded-md text-sm flex items-center gap-2
              ${bw.selected ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                                        >
                                            <bw.Icon className="w-4 h-4"/>
                                            {bw.text}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                        className="min-w-[160px] focus:bg-primary hover:bg-primary flex gap-2 items-center bg-conic-300 text-white">
                                    Price Range
                                    <ChevronDown className="w-4 h-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-4 bg-dark space-y-3">
                                <div className=" flex items-center justify-between border-b border-border mb-2">
                                    <h1>Price Range</h1>
                                    <Button size="sm" variant="ghost" onClick={handleClearPriceRange}
                                            className="text-xs text-red-500 hover:bg-red-500 hover:text-white">Clear</Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="minPrice"
                                               className="text-secondary text-xs font-black">min.</label>
                                        <Input
                                            type="number"
                                            id="minPrice"
                                            value={minPrice}
                                            onChange={(e) => handlePriceChange("min", e.target.value)}
                                            placeholder="Min"
                                            className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                                        />
                                    </div>
                                    <span className="text-white/60">-</span>
                                    <div className="flex flex-col">
                                        <label htmlFor="maxPrice"
                                               className="text-secondary text-xs font-black">min.</label>
                                        <Input
                                            type="number"
                                            id="maxPrice"
                                            value={maxPrice}
                                            onChange={(e) => handlePriceChange("max", e.target.value)}
                                            placeholder="Max"
                                            className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                        className="min-w-[150px] hover:bg-primary focus:bg-primary flex gap-2 items-center bg-conic-300 text-white">
                                    {minRating > 0 ? `${minRating}+ Stars` : "Rating"}
                                    <ChevronDown className="w-4 h-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-3 bg-dark flex flex-col gap-2">
                                <button onClick={() => setMinRating(0)}
                                        className={`px-3 py-2 rounded ${minRating === 0 ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                                    All Ratings
                                </button>
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <button
                                        key={rating}
                                        onClick={() => setMinRating(rating)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded
            ${minRating === rating ? "bg-[#1E293B] text-[#3B82F6]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                                    >
                                        {Array.from({length: rating}).map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-yellow-400" isActive={true}/>
                                        ))}
                                        {rating !== 5 && <span>& up</span>}
                                    </button>
                                ))}
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                        className="min-w-[180px] hover:bg-primary focus:bg-primary flex justify-between items-center bg-conic-300 text-white">
                                    {sortOptions.find(o => o.value === sortedBy)?.label}
                                    <ChevronDown className="w-4 h-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px] p-0 bg-dark">
                                <Command>
                                    <CommandGroup>
                                        {sortOptions.map(option => (
                                            <CommandItem
                                                key={option.value}
                                                onSelect={() => setSortedBy(option.value)}
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
                </>
            )}
        </div>
    );
};

export default FilterOptions;
