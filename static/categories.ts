import { cacheLife } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";

export const getCategories = async () => {
  "use cache";
  cacheLife("long-cache" as any)
  try {
    await connectToDatabase();
    const categories = await Category.find().lean();

    return categories;
  } catch (err) {
    return [];
  }
};
