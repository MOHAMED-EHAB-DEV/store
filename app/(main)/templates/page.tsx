import Templates from "@/components/shared/Templates";
import {TemplateService} from "@/lib/services/TemplateService";
import {CategoryService} from "@/lib/services/CategoryService";
import {serializeCategory, serializeTemplate} from "@/lib/utils";
import {toast} from "sonner";

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
        toast.error("Something went wrong");
        return [];
    }
}

const Page = async () => {
    const templates = await getInitialData();
    const rawCategories = await CategoryService.getMainCategories();
    const categories = rawCategories.map(serializeCategory);

    return (
        <main className="flex flex-col justify-center py-36 gap-8 overflow-x-hidden w-dvw px-5 md:px-56"
              role="main">
            <h1 className="text-white font-paras text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold">Templates</h1>

            <Templates initialData={templates} categories={categories} isHome={true} />
        </main>
    )
}
export default Page;