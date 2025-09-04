import Templates from "@/components/shared/Templates";
import {TemplateService} from "@/lib/services/TemplateService";
import {CategoryService} from "@/lib/services/CategoryService";
import {serializeCategory, serializeTemplate} from "@/lib/utils";

const Page = async () => {
    const rawTemplates = await TemplateService.getPopularTemplates(100, 0);
    const rawCategories = await CategoryService.getMainCategories();

    const templates = rawTemplates.map(serializeTemplate);
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