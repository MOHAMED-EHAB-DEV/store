import Templates from "@/components/shared/Templates";
import Template from "@/lib/models/Template";
import Category from "@/lib/models/Category";
import {serializeCategory, serializeTemplate} from "@/lib/utils";

const Page = async () => {
    const templates = await Template.find();
    const categories = await Category.find();

    // const templates = rawTemplates.map(serializeTemplate);
    // const categories = rawCategories.map(serializeCategory);
    return (
        <div className="grid grid-rows-[auto_1fr] h-full w-full p-8 gap-10">
            <h1 className="text-white font-bold text-3xl">Templates</h1>

            <Templates initialData={templates} categories={categories} />
        </div>
    )
};
export default Page;