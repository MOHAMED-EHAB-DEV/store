import React from "react";
import Template from "@/components/singleTemplate/Template";

const getTemplate = async (id: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status}`);
    }

    const data = await response.json();

    return data.success
      ? { data: data.data as ITemplate, err: null }
      : { err: data.message || "No Template Found", data: null };
  } catch (err: any) {
    return {
      err: `Error fetching template with id ${id}: ${err.message || err}`,
      data: null,
    };
  }
};

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const { data, err } = await getTemplate(id);

  if (err) {
    return (
      <div className="pt-36 sm:pt-46 md:pt-36 text-center text-red-500">
        {err}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-36 sm:pt-46 md:pt-36 text-center">
        Template not found
      </div>
    );
  }

  return (
    <div className="pt-36 sm:pt-46 md:pt-36">
      <Template template={data} />
    </div>
  );
};

export default Page;