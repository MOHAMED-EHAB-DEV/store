import "@/app/markdown.css";
import Template from "@/components/singleTemplate/Template";
import { ICategory, ITemplate } from "@/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarkdownCopyHandler from "@/components/Markdown/MarkdownCopyHandler";
import TemplateModel from "@/lib/models/Template";
import { connectToDatabase } from "@/lib/database";
import mongoose from "mongoose";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const revalidate = 604800; // 1 week

interface PageProps {
  params: Promise<{ id: string }>;
}

const getTemplate = async (id: string) => {
  try {
    await connectToDatabase();
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { slug: id }], isActive: true }
      : { slug: id, isActive: true };

    const template = await TemplateModel.findOne(query)
      .select("+content +reviewCount")
      .populate("categories", "_id name slug")
      .lean();

    return template
      ? { data: JSON.parse(JSON.stringify(template)) as ITemplate, err: null }
      : { err: "No Template Found", data: null };
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
    await connectToDatabase();
    const parsedCategoryIds = categoryIds.map((c: any) => c._id || c);
    
    const matchConditions: any = {
      isActive: true,
      $or: [],
    };

    if (mongoose.isValidObjectId(excludeId)) {
      matchConditions._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    } else {
      matchConditions._id = { $ne: excludeId };
    }

    if (parsedCategoryIds.length > 0) {
      matchConditions.$or.push({ categories: { $in: parsedCategoryIds } });
    }
    if (tags.length > 0) {
      matchConditions.$or.push({ tags: { $in: tags } });
    }

    if (matchConditions.$or.length === 0) {
      return { data: [], error: null };
    }

    const pipeline: any[] = [
      { $match: matchConditions },
      { $sort: { createdAt: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "template",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviews: { $size: "$reviews" },
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          slug: 1,
          description: 1,
          thumbnail: 1,
          demoLink: 1,
          demoVideo: 1,
          price: 1,
          downloads: 1,
          views: 1,
          averageRating: 1,
          reviews: 1,
          author: 1,
          categories: 1,
          tags: 1,
          createdAt: 1,
        },
      },
    ];

    const templates = await TemplateModel.aggregate(pipeline).allowDiskUse(true);

    return { data: JSON.parse(JSON.stringify(templates)) as ITemplate[], error: null };
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return {
      error: `Error fetching similar templates: ${err.message || err}`,
      data: null,
    };
  }
};

import { truncateDescription } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: template } = await getTemplate(id);

  if (!template) {
    return { title: "Template Not Found" };
  }

  const url = `${APP_URL}/templates/${id}`;
  const truncatedDesc = truncateDescription(template.description || `Premium template - ${template.title}`, 160);
  const imageUrl = template.thumbnail || `${APP_URL}/screenshots/1.png`;

  return {
    title: `${template.title} | MHD Store Premium Templates`,
    description: `Premium template - ${template.title}`,
    keywords: [
      ...(template.tags || []),
      "template",
      "web template",
    ].filter(Boolean),
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
          url: imageUrl,
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
      images: [imageUrl],
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
