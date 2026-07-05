export const getCategories = async () => {
  try {
    const categories = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://mhd-store.vercel.app"}/api/categories`,
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
