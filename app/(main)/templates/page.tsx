import Templates from "@/components/shared/Templates";
import { ICategory } from "@/types";
import { Metadata } from "next";
import { getCategories } from "@/static/categories";

type MetadataProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: MetadataProps): Promise<Metadata> {
  const params = await searchParams;
  const builtWith = params?.builtWith;
  const categories = params?.categories;

  let title = "Browse Templates | Mohammed Ehab Store";
  let description = "Explore our collection of premium web templates for SaaS, e-commerce, and portfolios.";

  if (categories && typeof categories === 'string') {
    // Capitalize first letter
    const categoryName = categories.charAt(0).toUpperCase() + categories.slice(1);
    title = `${categoryName} Templates | Premium Web Templates`;
    description = `Browse our premium collection of ${categoryName} templates. High-quality, modern, and optimized for your next project.`;
  } else if (builtWith && typeof builtWith === 'string') {
    title = `${builtWith} Templates | Premium Web Templates`;
    description = `Explore top-tier templates built with ${builtWith}. Perfect for SaaS, e-commerce, and portfolios.`;
  }

  const domain = process.env.NEXT_PUBLIC_APP_URL || 'https://mohammedehab.com';
  const url = `${domain}/templates`;

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const getInitialData = async ({
  builtWith,
  categories,
  tags,
  type,
}: {
  builtWith: string[] | string;
  categories: string[] | string;
  tags: string[] | string;
  type: string;
}) => {
  try {
    const params = new URLSearchParams();

    if (type) params.append("type", type);

    if (builtWith) {
      if (Array.isArray(builtWith)) {
        builtWith.forEach((b) => params.append("builtWith", b));
      } else {
        params.append("builtWith", builtWith);
      }
    }

    if (categories) {
      if (Array.isArray(categories)) {
        categories.forEach((c) => params.append("categories", c));
      } else {
        params.append("categories", categories);
      }
    }

    if (tags) {
      if (Array.isArray(tags)) {
        tags.forEach((t) => params.append("tags", t));
      } else {
        params.append("tags", tags);
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/template/search?${params.toString()}`,
      {
        next: { revalidate: 60 * 5 },
      },
    );

    const data = await response.json();
    if (data.success) return data.data;
    else throw new Error("Failed to fetch templates");
  } catch (err) {
    return [];
  }
};

interface PageProps {
  searchParams: {
    builtWith: string[] | string;
    categories: string[] | string;
    tags: string[] | string;
    type: string;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const templates = await getInitialData({ ...params });
  const categories = (await getCategories()) as ICategory[];

  return (
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
  );
};
export default Page;
