export const getCategories = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/categories`,
      {
        next: { revalidate: 60 * 60 * 24 * 7 }, // 7 days
      },
    );

    const data = await response.json();

    if (data.success) return data.data;
    else throw new Error("Failed to fetch categories");
  } catch (err) {
    return [];
  }
};
