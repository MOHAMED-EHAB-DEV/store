"use client";

import {useState, useEffect} from 'react';
import FilterOptions from "@/components/shared/FilterOptions";

declare type selected = {
    selected: boolean,
}

const Templates = ({templates, categories}: { templates: ITemplate[], categories: ICategory[] }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<(selected & ICategory)[]>(
        categories.map((category) => ({
            ...category,
            selected: false,
        }))
    );
    const uniqueTags = Array.from(
        new Set(templates.flatMap((template) => template.tags))
    ).map((tag) => ({
        tag,
        selected: false,
    }));

    const [selectedTags, setSelectedTags] = useState<{ tag: string; selected: boolean }[]>(uniqueTags);

    return (
        <div className="flex flex-col gap-5">
            <FilterOptions categories={selectedCategories} setCategories={setSelectedCategories} search={searchQuery}
                           setSearch={setSearchQuery} tags={selectedTags} setTags={setSelectedTags}/>
        </div>
    )
}
export default Templates;