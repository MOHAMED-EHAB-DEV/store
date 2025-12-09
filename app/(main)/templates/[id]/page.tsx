import React from "react";
import Template from "@/components/singleTemplate/Template";
import { ICategory, ITemplate } from "@/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const getTemplate = async (id: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/${id}`,
      { next: { revalidate: 300 } } // ISR: 5 minutes
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
  categoryIds: string[] | ICategory[],
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
      { next: { revalidate: 300 } } // ISR: 5 minutes
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

// Dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: template } = await getTemplate(id);

  if (!template) {
    return { title: "Template Not Found" };
  }

  return {
    title: `${template.title} | Premium Templates`,
    description: template.description?.substring(0, 160) || `Premium ${template.builtWith} template - ${template.title}`,
    openGraph: {
      title: template.title,
      description: template.description?.substring(0, 160),
      images: template.thumbnail ? [template.thumbnail] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: template.title,
      images: template.thumbnail ? [template.thumbnail] : [],
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  const { data: template, err } = await getTemplate(id);

  if (!template) {
    notFound();
  }

  const { data: similarTemplates } = await getSimilarTemplates(
    template.categories || [],
    template.builtWith,
    template.tags || [],
    id
  );

  return (
    <div className="pt-36 sm:pt-46 md:pt-36">
      <Template template={template} similarTemplates={similarTemplates || []} />
    </div>
  );
};

export default Page;
