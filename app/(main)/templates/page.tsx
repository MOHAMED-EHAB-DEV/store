import { cacheLife, cacheTag } from "next/cache";
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
  const builtWith = params?.builtWith;
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
  } else if (builtWith && typeof builtWith === "string") {
    title = `${builtWith} Templates | Premium Web Templates`;
    description = `Explore top-tier templates built with ${builtWith}. Perfect for SaaS, e-commerce, and portfolios.`;
  }

  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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

const getInitialData = async (params: {
  [key: string]: string | string[] | undefined;
}) => {
  "use cache";
  cacheLife("short-cache" as any);
  cacheTag("templates");
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
  const categories = await getCategories() as ICategory[];

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
