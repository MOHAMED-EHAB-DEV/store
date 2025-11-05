'use client';

import TemplateSkeleton from "@/components/ui/TemplateSkeleton";
import Template from "@/components/shared/Template";
import { useState, useEffect } from 'react';
import { ITemplate } from "@/types";

const FavoritesClient = () => {
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getFavorites = async () => {
            try {
                const res = await fetch(`/api/user/favorites`);
                const data = await res.json();
                if (data.success) {
                    setTemplates(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
                setErrorMessage("Failed to fetch favorites");
            } finally {
                setIsLoading(false);
            }
        }

        getFavorites();
    }, []);
    return isLoading ? (
        <div className="flex items-center justify-center flex-wrap gap-6">
            {[...Array(6)].map((_, idx) => (
                <TemplateSkeleton key={idx} />
            ))}
        </div>
    ) : templates.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-5`}>
            {templates.map((template, idx) => <Template showActionButtons={true} showPrice={true}
                key={template?._id! as string} template={template}/>)}
        </div>
    ) : (
        <p className="text-gray-400 text-center">{errorMessage ? errorMessage : "No favorite templates found."}</p>
    )
}
export default FavoritesClient
