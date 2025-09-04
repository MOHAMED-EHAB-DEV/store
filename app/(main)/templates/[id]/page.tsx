import React from 'react';
import Template from "@/components/singleTemplate/Template";

const getTemplate = async (id: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/template/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status}`);
        }
        const data = await response.json();

        return data.success ? {
            data: data.data as ITemplate[],
            err: null
        } : {
            err: data.message || 'No Template Found',
            data: null,
        };
    } catch (err) {
        return {
            err: `Error fetching template with id ${id}: ${err}`,
            data: null,
        };
    }
}

const Page = async ({params}:{params: {id: string}}) => {
    const {id} = await params;
    const {data, err} = await getTemplate(id);
    return (
        <div className="pt-36 sm:pt-46 md:pt-36">
            {err ? (
                <div className="text-center text-red-500">{err}</div>
            ) : !data ? (
                <div className="text-center">Loading...</div>
            ) : (
                <Template
                    template={data}
                />
            )}
        </div>
    )
}
export default Page
