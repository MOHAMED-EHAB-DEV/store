export interface GlobalSearchItem {
  id: string;
  title: string;
  category: "Page" | "Service" | "Templates" | "Category" | "Blog" | "Support";
  url: string;
  iconName: "templates" | "code" | "pricing" | "blog" | "faq" | "support" | "dashboard" | "folder" | "article" | "sparkles";
}

export const GlobalSearchItems: GlobalSearchItem[] = [
  {
    id: "templates",
    title: "Browse Templates",
    category: "Templates",
    url: "/templates",
    iconName: "templates",
  },
  {
    id: "custom-dev",
    title: "Custom Development",
    category: "Service",
    url: "/custom-development",
    iconName: "code",
  },
  {
    id: "cat-saas",
    title: "SaaS Templates",
    category: "Category",
    url: "/templates?categories=saas",
    iconName: "folder",
  },
  {
    id: "cat-ecommerce",
    title: "E-Commerce Templates",
    category: "Category",
    url: "/templates?categories=ecommerce",
    iconName: "folder",
  },
  {
    id: "cat-portfolio",
    title: "Portfolio & Agency Templates",
    category: "Category",
    url: "/templates?categories=portfolio",
    iconName: "folder",
  },
  {
    id: "pricing",
    title: "Pricing & Lifetime Plans",
    category: "Page",
    url: "/pricing",
    iconName: "pricing",
  },
  {
    id: "blog",
    title: "Blog & Articles",
    category: "Blog",
    url: "/blog",
    iconName: "blog",
  },
  {
    id: "faqs",
    title: "Frequently Asked Questions",
    category: "Support",
    url: "/faqs",
    iconName: "faq",
  },
  {
    id: "support",
    title: "Customer Support & Chat",
    category: "Support",
    url: "/support",
    iconName: "support",
  },
  {
    id: "dashboard",
    title: "Client Dashboard",
    category: "Page",
    url: "/dashboard",
    iconName: "dashboard",
  },
];

let cachedSearchItems: GlobalSearchItem[] | null = null;
let searchItemsPromise: Promise<GlobalSearchItem[]> | null = null;

export async function getLiveSearchItems(): Promise<GlobalSearchItem[]> {
  if (cachedSearchItems) return cachedSearchItems;
  if (!searchItemsPromise) {
    searchItemsPromise = fetch("/api/page-search")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          cachedSearchItems = data.data;
          return data.data;
        }
        return GlobalSearchItems;
      })
      .catch(() => GlobalSearchItems)
      .finally(() => {
        searchItemsPromise = null;
      });
  }
  return searchItemsPromise;
}
