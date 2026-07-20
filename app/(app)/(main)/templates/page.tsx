import Templates from "@/components/shared/Templates";
import { ICategory } from "@/lib/validations/category";
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

  let title = "Premium Next.js Templates | Buy & Download | MHD Store";
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
          url: `${domain}/og/home-desktop.png`,
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
      images: [`${domain}/og/home-desktop.png`],
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
          urlParams.set(key, value.join(","));
        } else {
          urlParams.set(key, value);
        }
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/search?${urlParams.toString()}`,
      { cache: "no-store" }
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
  const allTags = Array.from(new Set(templates.flatMap((t: any) => t.tags))) as string[];

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: APP_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Templates",
        item: `${APP_URL}/templates`,
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
      <main
        className="flex flex-col justify-center px-2 py-36 gap-8 w-dvw max-w-6xl mx-auto"
        role="main"
        id="main-content"
      >
        <div className="space-y-4">
          <h1 className="text-white font-paras text-4xl sm:text-5xl md:text-6xl font-bold">
            Premium Next.js & Tailwind CSS Templates
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Launch your next project faster with our high-quality, production-ready React templates. 
            Built with modern technologies and optimized for performance.
          </p>
        </div>

        <Templates
          initialData={templates}
          categories={categories}
          searchParams={params}
          allTags={allTags}
        />
      </main>
    </>
  );
};
export default Page;
