import React from 'react';
import Template from "@/components/singleTemplate/Template";

const getTemplate = async (id: string) => {
    try {
        const response = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/template/${id}`);
        const data = await response.json();

        return data.success ? data.data : {};
    } catch (err) {
        console.log(`Error while trying to get template: ${err}`);
        return {};
    }
}

const Page = async ({params}:{params: {id: string}}) => {
    const {id} = await params;
    const template = await getTemplate(id);
    return (
        <div className="pt-36 sm:pt-46 md:pt-36">
            <Template
                template={template}
            />
        </div>
    )
}
export default Page
