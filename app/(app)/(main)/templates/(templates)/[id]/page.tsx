import Template from "@/components/singleTemplate/Template";
import { ICategory, ITemplate } from "@/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarkdownCopyHandler from "@/components/Markdown/MarkdownCopyHandler";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface PageProps {
  params: Promise<{ id: string }>;
}

const getTemplate = async (id: string) => {
  try {
    const response = await fetch(
      `${APP_URL}/api/template/${id}?isActive=true`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 7, // 1 week
          tags: ["everyTemplate", `template-${id}`],
        },
      },
    );

    if (!response.ok)
      throw new Error(`Failed to fetch template: ${response.status}`);

    const data = await response.json();

    return data.success
      ? { data: data.data as ITemplate, err: null }
      : { err: data.message || "No Template Found", data: null };
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return {
      err: `Error fetching template with id ${id}: ${err.message || err}`,
      data: null,
    };
  }
};

const getSimilarTemplates = async (
  categoryIds: (string | ICategory)[],
  builtWith: string,
  tags: string[],
  excludeId: string,
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
      `${APP_URL}/api/templates?${queryParams.toString()}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 7, // 1 week
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch similar templates: ${response.status}`);
    }

    const data = await response.json();

    return data.success
      ? { data: data.data as ITemplate[], error: null }
      : { error: data.message || "No similar templates found", data: null };
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return {
      error: `Error fetching similar templates: ${err.message || err}`,
      data: null,
    };
  }
};

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: template } = await getTemplate(id);

  if (!template) {
    return { title: "Template Not Found" };
  }

  const url = `${APP_URL}/templates/${id}`;

  return {
    title: `${template.title} | MHD Store Premium Templates`,
    description:
      template.description?.substring(0, 160) ||
      `Premium ${template.builtWith} template - ${template.title}`,
    keywords: [
      ...(template.tags || []),
      template.builtWith || "",
      "template",
      "web template",
    ].filter(Boolean),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${template.title} | Premium Templates`,
      description: template.description?.substring(0, 160),
      url: url,
      type: "website",
      images: template.thumbnail
        ? [
            {
              url: template.thumbnail,
              width: 1200,
              height: 630,
              alt: template.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.title} | Premium Templates`,
      description: template.description?.substring(0, 160),
      images: template.thumbnail ? [template.thumbnail] : [],
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  const { data: template } = await getTemplate(id);

  if (!template) {
    notFound();
  }

  const { data: similarTemplates } = await getSimilarTemplates(
    template.categories || [],
    template.builtWith,
    template.tags || [],
    id,
  );

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "SoftwareApplication"],
    name: template.title,
    applicationCategory: "WebApplication",
    description: template.description,
    image: template.thumbnail,
    url: `${APP_URL}/templates/${id}`,
    offers: {
      "@type": "Offer",
      price: template.price || 0,
      priceCurrency: "USD",
      availability: template.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(template.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: template.averageRating,
        reviewCount: template.reviewCount || 1,
      },
    }),
    category: template.builtWith,
    brand: {
      "@type": "Brand",
      name: "Premium Templates",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Templates",
        item: `${APP_URL}/templates`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: template.title,
        item: `${APP_URL}/templates/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarkdownCopyHandler />
      <main className="min-h-screen py-24 md:py-28 text-gray-200">
        <div className="max-w-7xl px-4">
          <Template
            template={template}
            similarTemplates={similarTemplates || []}
          />
        </div>
      </main>
    </>
  );
};

export default Page;
