import React from "react";
import Template from "@/components/singleTemplate/Template";

const getTemplate = async (id: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/${id}`,
      { cache: "no-store" }
    );

    if (!response.ok)
      throw new Error(`Failed to fetch template: ${response.status}`);


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

const getSimilarTemplates = async (
  categoryIds: string[],
  builtWith: string,
  tags: string[],
  excludeId: string
) => {
  try {
    const queryParams = new URLSearchParams({
      categories: categoryIds.join(","),
      tags: tags.join(","),
      builtWith,
      excludeId,
      limit: "3",
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/templates?${queryParams.toString()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch similar templates: ${response.status}`);
    }

    const data = await response.json();

    return data.success
      ? { data: data.data as ITemplate[], error: null }
      : { error: data.message || "No similar templates found", data: null };
  } catch (err: any) {
    return {
      error: `Error fetching similar templates: ${err.message || err}`,
      data: null,
    };
  }
};

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const { data: template, err } = await getTemplate(id);

  if (!template) {
    return (
      <div className="pt-36 sm:pt-46 md:pt-36 text-center text-red-500">
        {err || "Template not found"}
      </div>
    );
  }

  const { data: similarTemplates, error } = await getSimilarTemplates(
    template.categories.map(({ _id }) => _id) || [],
    template.builtWith,
    template.tags || [],
    id
  );

  if (error) {
    return (
      <div className="pt-36 sm:pt-46 md:pt-36 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="pt-36 sm:pt-46 md:pt-36">
      <Template template={template} similarTemplates={similarTemplates || []} />
    </div>
  );
};

export default Page;
