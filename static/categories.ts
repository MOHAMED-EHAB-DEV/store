export const getCategories = async () => {
  try {
    const categories = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/categories`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 7, // 1 week
        },
      },
    ).then((res) => res.json());

    return categories.data;
  } catch (err) {
    return [];
  }
};
