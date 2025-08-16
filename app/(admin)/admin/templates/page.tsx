import Templates from "@/components/shared/Templates";
import {TemplateService} from "@/lib/services/TemplateService";
import {CategoryService} from "@/lib/services/CategoryService";
import {serializeCategory, serializeTemplate} from "@/lib/utils";

const Page = async () => {
    const rawTemplates = await TemplateService.getPopularTemplates(15, 0);
    const rawCategories = await CategoryService.getMainCategories();

    const templates = rawTemplates.map(serializeTemplate);
    const categories = rawCategories.map(serializeCategory);
    return (
        <div className="grid grid-rows-[auto_1fr] h-full w-full p-8 gap-10">
            <h1 className="text-white font-bold text-3xl">Templates</h1>

            <Templates templates={templates} categories={categories} />
        </div>
    )
};
export default Page;