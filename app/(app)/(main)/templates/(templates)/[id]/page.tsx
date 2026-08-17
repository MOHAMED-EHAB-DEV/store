import "@/app/markdown.css";
import Template from "@/components/singleTemplate/Template";
import { ICategory } from "@/lib/validations/category";
import { ITemplate } from "@/lib/validations/template";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarkdownCopyHandler from "@/components/Markdown/MarkdownCopyHandler";
import { truncateDescription } from "@/lib/seo";
import { getImageProps } from "@/lib/utils/image";
import { getThumbnailData } from "@/lib/image-utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface PageProps {
  params: Promise<{ id: string }>;
}

const getTemplate = async (id: string) => {
  try {
    const response = await fetch(`${APP_URL}/api/template/${id}`, {
      next: {
        revalidate: 60 * 60 * 24 * 7, // 1 week
        tags: ["everyTemplate", `template-${id}`],
      },
    });

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
  tags: string[],
  excludeId: string,
) => {
  try {
    const categoryQuery = categoryIds
      .map((c) => (typeof c === "string" ? c : c._id || c.name))
      .filter(Boolean)
      .join(",");

    const queryParams = new URLSearchParams({
      categories: categoryQuery,
      tags: tags.join(","),
      excludeId,
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: template } = await getTemplate(id);

  if (!template) {
    return { title: "Template Not Found" };
  }

  const thumbUrl =
    getThumbnailData(template.thumbnail).url || `${APP_URL}/screenshots/1.png`;
  const url = `${APP_URL}/templates/${template.slug || id}`;
  const typeLabel =
    template.type === "coded"
      ? "Next.js Template"
      : template.type === "framer"
        ? "Framer Template"
        : "Figma UI Kit";
  const priceLabel =
    template.price === 0 ? "Free Download" : `$${template.price}`;

  const truncatedDesc = truncateDescription(
    `${template.title} — ${template.description} | ${typeLabel} | ${priceLabel}`,
    160,
  );

  const keywords = [
    ...(template.tags || []),
    template.type,
    "template",
    "web template",
    "nextjs template",
    "premium template",
    template.price === 0 ? "free template" : "commercial template",
  ].filter(Boolean) as string[];

  return {
    title: `${template.title} — ${typeLabel} | MHD Store`,
    description: truncatedDesc,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${template.title} | Premium Templates`,
      description: truncatedDesc,
      url: url,
      type: "website",
      images: [
        {
          url: thumbUrl,
          width: 1200,
          height: 630,
          alt: template.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.title} | Premium Templates`,
      description: truncatedDesc,
      images: [thumbUrl],
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
    template.tags || [],
    template?._id,
  );

  const thumbUrl = getThumbnailData(template.thumbnail).url;
  const templateSlug = template.slug || id;
  const primaryCategory =
    template.categories && template.categories.length > 0
      ? typeof template.categories[0] === "string"
        ? {
            name: template.categories[0],
            slug: template.categories[0].toLowerCase(),
          }
        : (template.categories[0] as any)
      : null;

  // Rich JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "SoftwareApplication"],
    name: template.title,
    applicationCategory:
      template.type === "coded"
        ? "WebApplication"
        : template.type === "framer"
          ? "DesignApplication"
          : "DesignApplication",
    operatingSystem: "Web, Cross-Platform",
    description: template.description,
    image: thumbUrl,
    url: `${APP_URL}/templates/${templateSlug}`,
    ...(template.createdAt && {
      datePublished: new Date(template.createdAt).toISOString(),
    }),
    ...(template.updatedAt && {
      dateModified: new Date(template.updatedAt).toISOString(),
    }),
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
    brand: {
      "@type": "Brand",
      name: "MHD Store Premium Templates",
    },
  };

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${APP_URL}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Templates",
      item: `${APP_URL}/templates`,
    },
  ];

  if (primaryCategory) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: primaryCategory.name,
      item: `${APP_URL}/templates/${primaryCategory.slug || primaryCategory.name.toLowerCase()}`,
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 4,
      name: template.title,
      item: `${APP_URL}/templates/${templateSlug}`,
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: template.title,
      item: `${APP_URL}/templates/${templateSlug}`,
    });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const templatePreload = thumbUrl
    ? getImageProps({
        src: thumbUrl,
        sizes: "(min-width: 1024px) 800px, (min-width: 640px) 600px, 100vw",
        quality: 80,
        defaultWidth: 800,
      })
    : null;

  return (
    <>
      {templatePreload && <link {...templatePreload.preloadProps} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarkdownCopyHandler />
      <main className="min-h-screen pt-20 sm:pt-24 pb-16 md:pb-24 text-gray-200">
        <Template
          template={template}
          similarTemplates={similarTemplates || []}
        />
      </main>
    </>
  );
};

export default Page;
