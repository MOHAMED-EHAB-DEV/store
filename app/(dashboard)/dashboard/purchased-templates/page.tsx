import Templates from "@/components/shared/Templates";
import Template from "@/lib/models/Template";
import Category from "@/lib/models/Category";
import { ITemplate } from "@/types";

const Page = async () => {
    const templates = await Template.find();
    const categories = await Category.find();
    return (
        <div className="grid grid-rows-[auto_1fr] h-full w-full p-8 gap-10">
            <h1 className="text-white font-bold text-3xl">Purchased Templates</h1>

            <Templates initialData={templates as ITemplate[]} categories={categories} />
        </div>
    )
}
export default Page;