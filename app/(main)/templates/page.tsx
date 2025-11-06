import Templates from "@/components/shared/Templates";
import Category from "@/lib/models/Category";
import { ICategory } from "@/types";

const getInitialData = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/search`);

        if (!response.ok)
            throw new Error(`Failed to fetch template: ${response.status}`);

        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            return [];
        }
    } catch (err) {
        return [];
    }
}

const Page = async () => {
    const templates = await getInitialData();
    const categories : ICategory[] = await Category.find().lean().then((docs) => docs.map((doc) => ({
        ...doc,
        _id: `${doc?._id}`,
        parentCategory: doc?.parentCategory ? `${doc.parentCategory}` : null,
        createdAt: doc?.createdAt as Date,
        updatedAt: doc?.updatedAt as Date,
    } as unknown as ICategory)));

    return (
        <main className="flex flex-col justify-center py-36 gap-8 overflow-x-hidden w-dvw px-5 md:px-56"
            role="main">
            <h1 className="text-white font-paras text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold">Templates</h1>

            <Templates initialData={templates} categories={categories} isHome={true} />
        </main>
    )
}
export default Page;