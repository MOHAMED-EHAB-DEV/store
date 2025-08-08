import {Dispatch, SetStateAction, useState} from "react";
import { Search, ChevronDown, ChevronUp, } from "@/components/ui/svgs/Icons";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";

const FilterOptions = ({
                           search,
                           setSearch,
                           categories,
                           setCategories,
                           tags,
                           setTags,
                       }: {
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    categories: ICategory[];
    setCategories: Dispatch<SetStateAction<ICategory[]>>;
    tags: { tag: string; selected: boolean }[];
    setTags: Dispatch<SetStateAction<{ tag: string; selected: boolean }[]>>;
}) => {
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isTagsOpen, setIsTagsOpen] = useState(false);

    const handleClearAllTags = () => {
        setTags(tags.map(tag => ({ ...tag, selected: false })));
    };

    const handleSelectAllTags = () => {
        setTags(tags.map(tag => ({ ...tag, selected: true })));
    };

    const handleClearAllCategories = () => {
        setCategories(categories.map(category => ({ ...category, selected: false })));
    }

    const handleSelectAllCategories = () => {
        setCategories(categories.map(category => ({ ...category, selected: true })));
    }
    return (
        <div className="w-full flex gap-3 items-center flex-wrap">
            <div className="relative w-1/10 flex-1">
                <Search className="absolute left-4 z-20 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                    placeholder="Search..."
                    required
                />
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} variant="outline" className="min-w-[250px] flex gap-2 outline-none focus:outline-none border-none items-center bg-conic-300 text-white">
                        {categories.filter((c) => c.selected).length > 0
                            ? `${categories.filter((c) => c.selected).length} Category(s) selected`
                            : "Select Category"}
                        {isCategoriesOpen ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                    <div className="p-2 flex items-center justify-between border-b border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAllCategories}
                            className="text-xs"
                        >
                            Select All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllCategories}
                            className="text-xs text-red-500"
                        >
                            Clear All
                        </Button>
                    </div>
                    <Command className="max-h-[200px] overflow-auto">
                        <CommandGroup>
                            {categories.map((categObj, idx) => (
                                <CommandItem
                                    key={categObj._id}
                                    onSelect={() => {
                                        const updated = [...categories];
                                        updated[idx].selected = !updated[idx].selected;
                                        setCategories(updated);
                                    }}
                                    className="cursor-pointer gap-2"
                                >
                                    <Checkbox
                                        checked={categObj.selected}
                                        onCheckedChange={() => {
                                            const updated = [...categories];
                                            updated[idx].selected = !updated[idx].selected;
                                            setCategories(updated);
                                        }}
                                    />
                                    <span className="capitalize">{categObj.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" onClick={() => setIsTagsOpen(!isTagsOpen)} className="min-w-[250px] flex gap-2 items-center outline-none focus:outline-none border-none bg-conic-300 text-white">
                        {tags.filter((t) => t.selected).length > 0
                            ? `${tags.filter((t) => t.selected).length} tag(s) selected`
                            : "Select Tags"}
                        {isTagsOpen ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                    <div className="p-2 flex items-center justify-between border-b border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAllTags}
                            className="text-xs"
                        >
                            Select All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllTags}
                            className="text-xs text-red-500"
                        >
                            Clear All
                        </Button>
                    </div>
                    <Command className="max-h-[200px] overflow-auto">
                        <CommandGroup>
                            {tags.map((tagObj, index) => (
                                <CommandItem
                                    key={tagObj.tag}
                                    onSelect={() => {
                                        const updated = [...tags];
                                        updated[index].selected = !updated[index].selected;
                                        setTags(updated);
                                    }}
                                    className="cursor-pointer gap-2"
                                >
                                    <Checkbox
                                        checked={tagObj.selected}
                                        onCheckedChange={() => {
                                            const updated = [...tags];
                                            updated[index].selected = !updated[index].selected;
                                            setTags(updated);
                                        }}
                                    />
                                    <span className="capitalize">{tagObj.tag}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default FilterOptions;
