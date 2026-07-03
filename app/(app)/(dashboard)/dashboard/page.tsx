import { Metadata } from "next";
import DashboardHome from "@/components/Dashboard/DashboardHome";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Dashboard | Home",
  description: "Your personal dashboard overview",
  robots: {
    index: false,
    follow: false,
  },
};


async function getDashboardData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const cookieHeader = token ? `token=${token}` : "";

  try {
    const [templatesRes, ticketsRes] = await Promise.all([
      fetch(`${baseUrl}/api/user/templates`, { headers: { Cookie: cookieHeader } }),
      fetch(`${baseUrl}/api/user/tickets`, { headers: { Cookie: cookieHeader } }),
    ]);

    const templates = templatesRes.ok
      ? await templatesRes.json()
      : { data: [] };
    const tickets = ticketsRes.ok ? await ticketsRes.json() : { data: [] };

    return {
      templates: templates.data || [],
      tickets: tickets.data || [],
    };
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("Error fetching dashboard data:", error);
    return { templates: [], tickets: [] };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardHome data={data} />;
}
