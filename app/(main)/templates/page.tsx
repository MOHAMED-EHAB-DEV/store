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
        <main className="flex flex-col justify-center py-36 gap-4 overflow-x-hidden w-[100dvw] px-5 md:px-56"
              role="main">
            <h1 className="text-white text-4xl font-bold">Templates</h1>

            <Templates initialData={templates} categories={categories} isHome={true} />
        </main>
    )
}
export default Page;