import StatsSectionClient, { StatsBaseline } from "./StatsSectionClient";

async function getStats(): Promise<StatsBaseline> {
  const fallbackStats: StatsBaseline = {
    templates: 10,
    customers: 1000,
    downloads: 2000,
    rating: 4.9,
  };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mhd-store.vercel.app";
    const response = await fetch(`${baseUrl}/api/stats`, {
      next: { revalidate: 60 * 60 * 24 * 7, tags: ["home-stats"] },
    });

    if (!response.ok) {
      return fallbackStats;
    }

    const resData = await response.json();
    if (resData.success && resData.data) {
      return {
        templates: Number(resData.data.templates) || fallbackStats.templates,
        customers: Number(resData.data.customers) || fallbackStats.customers,
        downloads: Number(resData.data.downloads) || fallbackStats.downloads,
        rating: Number(resData.data.rating) || fallbackStats.rating,
      };
    }

    return fallbackStats;
  } catch (error) {
    return fallbackStats;
  }
}

export default async function StatsSection() {
  const stats = await getStats();

  return <StatsSectionClient stats={stats} />;
}
