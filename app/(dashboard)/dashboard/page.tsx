import { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHome from "@/components/Dashboard/DashboardHome";
import { authenticateUser } from "@/middleware/auth";

export const metadata: Metadata = {
  title: "Dashboard | Home",
  description: "Your personal dashboard overview",
};

async function getDashboardData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const [templatesRes, ticketsRes] = await Promise.all([
      fetch(`${baseUrl}/api/user/templates`),
      fetch(`${baseUrl}/api/user/tickets`),
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
  const user = await authenticateUser(true);
  if (!user) redirect("/");

  const data = await getDashboardData();

  return <DashboardHome user={user} data={data} />;
}
