import { getCategoryIcon } from "@/components/ui/svgs/CategoriesIcons";
import { getBaseUrl } from "@/lib/utils/server";

export const getCategories = async () => {
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

    return categories.data;
  } catch (err) {
    return [];
  }
};
