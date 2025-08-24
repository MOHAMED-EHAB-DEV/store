"use client";

import {useState, useEffect, Suspense} from 'react';
import FilterOptions from "@/components/shared/FilterOptions";
import Template from "@/components/shared/Template";
import TemplateSkeleton from "@/components/ui/TemplateSkeleton";

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

            <Suspense fallback={
                <div className="flex items-center justify-center flex-wrap gap-6">
                    {[...Array(6)].map((_, idx) => (
                        <TemplateSkeleton key={idx} />
                    ))}
                </div>
            }>
                <div className="flex items-center justify-center flex-wrap gap-6">
                    {templates.map((template, idx) => <Template showActionButtons={true} showPrice={true} key={template._id} template={template} idx={idx} />)}
                </div>
            </Suspense>
        </div>
    )
}
export default Templates;