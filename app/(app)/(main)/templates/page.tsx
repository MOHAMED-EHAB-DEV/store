import Templates from "@/components/shared/Templates";
import { ICategory } from "@/types";

const getInitialData = async ({ builtWith, categories, tags, type }: {
    builtWith: string[] | string,
    categories: string[] | string,
    tags: string[] | string,
    type: string,
}) => {
    try {
        const params = new URLSearchParams();

        if (type) params.append("type", type);

        if (builtWith) {
            if (Array.isArray(builtWith)) {
                builtWith.forEach((b) => params.append("builtWith", b));
            } else {
                params.append("builtWith", builtWith);
            }
        }

        if (categories) {
            if (Array.isArray(categories)) {
                categories.forEach((c) => params.append("categories", c));
            } else {
                params.append("categories", categories);
            }
        }

        if (tags) {
            if (Array.isArray(tags)) {
                tags.forEach((t) => params.append("tags", t));
            } else {
                params.append("tags", tags);
            }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/search?${params.toString()}`, {
            next: { revalidate: 300 }
        });

        const data = await response.json();
        if (data.success) return data.data; else throw new Error("Failed to fetch templates");
    } catch (err) {
        return [];
    }
};

const getCategories = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/categories`, {
            next: { revalidate: 3600 }
        });

        const data = await response.json();

        if (data.success) return data.data; else throw new Error('Failed to fetch categories');
    } catch (err) {
        return [];
    };
}

interface PageProps {
    searchParams: {
        builtWith: string[] | string;
        categories: string[] | string;
        tags: string[] | string;
        type: string,
    };
}

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams;
    const templates = await getInitialData({ ...params });
    const categories = await getCategories() as ICategory[];

    return (
        <main className="flex flex-col justify-center py-36 gap-8 overflow-x-hidden w-dvw px-5 md:px-56"
            role="main">
            <h1 className="text-white font-paras text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold">Templates</h1>

            <Templates initialData={templates} categories={categories} isHome={true} searchParams={params} />
        </main>
    )
}
export default Page;