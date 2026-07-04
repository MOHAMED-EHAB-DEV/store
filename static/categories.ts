import { getBaseUrl } from "@/lib/utils/server";

export const getCategories = async (includeIcon?: boolean) => {
  try {
    const baseUrl = await getBaseUrl();
    const categories = await fetch(
      `${baseUrl}/api/categories`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 7, // 1 week
          tags: ["categories"],
        },
      },
    ).then((res) => res.json());

    if (!includeIcon && categories.data) {
      return categories.data.map((c: any) => {
        const { icon, ...rest } = c;
        return rest;
      });
    }

    return categories.data;
  } catch (err) {
    return [];
  }
};
