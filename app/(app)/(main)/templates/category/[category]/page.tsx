import Templates from "@/components/shared/Templates";
import { ICategory } from "@/lib/validations/category";
import { Metadata } from "next";
import { getCategories } from "@/static/categories";

type MetadataProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: MetadataProps): Promise<Metadata> {
  const { category } = await params;

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `${categoryName} Templates | Premium Web Templates`;
  const description = `Browse our premium collection of ${categoryName} templates. High-quality, modern, and optimized for your next project.`;

  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${domain}/templates/category/${category}`;

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

const getInitialData = async (
  categoryParam: string,
  searchParamsObj: { [key: string]: string | string[] | undefined },
) => {
  try {
    const urlParams = new URLSearchParams();

    // Always set the category from the static route
    urlParams.set("categories", categoryParam);

    Object.entries(searchParamsObj).forEach(([key, value]) => {
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
      {
        next: {
          revalidate: 60 * 60 * 5, // 5 hours
          tags: [`category-${categoryParam}`],
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
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ params, searchParams }: PageProps) => {
  const { category } = await params;
  const currentSearchParams = await searchParams;

  const templates = await getInitialData(category, currentSearchParams);
  const categories = (await getCategories()) as ICategory[];

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Web Templates`,
    description: `Browse our collection of premium ${category} web templates for SaaS, e-commerce, and portfolios.`,
    url: `${APP_URL}/templates/category/${category}`,
    numberOfItems: templates.length,
    itemListElement: templates.map((template: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${APP_URL}/templates/${template.slug || template._id}`,
      item: {
        "@type": "Product",
        name: template.title,
        image: template.thumbnail,
        description: template.description,
        url: `${APP_URL}/templates/${template.slug || template._id}`,
        offers: {
          "@type": "Offer",
          price: template.price || 0,
          priceCurrency: "USD",
          availability: template.isActive
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
    })),
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
      {
        "@type": "ListItem",
        position: 3,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        item: `${APP_URL}/templates/category/${category}`,
      },
    ],
  };

  const currentCategory = categories.find((c) => c.slug === category);

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
        className="flex flex-col justify-center py-36 gap-8 w-full max-w-6xl mx-auto px-4"
        role="main"
        id="main-content"
      >
        <div className="space-y-4">
          <h1 className="text-white font-paras text-3xl sm:text-4xl md:text-5xl font-bold">
            {category.charAt(0).toUpperCase() + category.slice(1)} Templates
          </h1>
          {currentCategory?.description && (
            <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
              {currentCategory.description}
            </p>
          )}
        </div>

        <Templates
          initialData={templates}
          categories={categories}
          searchParams={currentSearchParams}
          hideCategoryFilter={true}
        />
      </main>
    </>
  );
};
export default Page;
