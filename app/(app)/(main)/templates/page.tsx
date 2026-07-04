import Templates from "@/components/shared/Templates";
import { ICategory } from "@/types";
import { Metadata } from "next";
import { getCategories } from "@/static/categories";

type MetadataProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: MetadataProps): Promise<Metadata> {
  const params = await searchParams;

  const categories = params?.categories;

  let title = "Browse Templates | Mohammed Ehab Store";
  let description =
    "Explore our collection of premium web templates for SaaS, e-commerce, and portfolios.";

  if (categories && typeof categories === "string") {
    // Capitalize first letter
    const categoryName =
      categories.charAt(0).toUpperCase() + categories.slice(1);
    title = `${categoryName} Templates | Premium Web Templates`;
    description = `Browse our premium collection of ${categoryName} templates. High-quality, modern, and optimized for your next project.`;
  }

  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const searchParamsString = new URLSearchParams(params as any).toString();
  const url = `${domain}/templates${searchParamsString ? `?${searchParamsString}` : ""}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: `${domain}/assets/Icons/cover.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${domain}/assets/Icons/cover.jpg`],
    },
  };
}

const getInitialData = async (params: {
  [key: string]: string | string[] | undefined;
}) => {
  try {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => urlParams.append(key, v));
        } else {
          urlParams.append(key, value);
        }
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/search?${urlParams.toString()}`,
      {
        next: {
          revalidate: 60 * 60 * 5,
        },
      },
    );

    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error("Failed to fetch templates");
    }
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return [];
  }
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const templates = await getInitialData(params);
  const categories = (await getCategories()) as ICategory[];

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Premium Web Templates",
    "description": "Browse our collection of premium web templates for SaaS, e-commerce, and portfolios.",
    "url": `${APP_URL}/templates`,
    "numberOfItems": templates.length,
    "itemListElement": templates.map((template: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${APP_URL}/templates/${template.slug || template._id}`,
      "item": {
        "@type": "Product",
        "name": template.title,
        "image": template.thumbnail,
        "description": template.description,
        "url": `${APP_URL}/templates/${template.slug || template._id}`,
        "offers": {
          "@type": "Offer",
          "price": template.price || 0,
          "priceCurrency": "USD",
          "availability": template.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        className="flex flex-col justify-center py-36 gap-8 overflow-x-hidden w-dvw max-w-6xl"
        role="main"
        id="main-content"
      >
        <h1 className="text-white font-paras text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold">
          Templates
        </h1>

        <Templates
          initialData={templates}
          categories={categories}
          searchParams={params}
        />
      </main>
    </>
  );
};
export default Page;
