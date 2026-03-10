import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardHome from "@/components/Dashboard/DashboardHome";
import { authenticateUser } from "@/middleware/auth";

export const metadata: Metadata = {
    title: "Dashboard | Home",
    description: "Your personal dashboard overview"
};

export const dynamic = "force-dynamic";

async function getDashboardData() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const [templatesRes, ticketsRes] = await Promise.all([
            fetch(`${baseUrl}/api/user/templates`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            }),
            fetch(`${baseUrl}/api/user/tickets`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            })
        ]);

        const templates = templatesRes.ok ? await templatesRes.json() : { data: [] };
        const tickets = ticketsRes.ok ? await ticketsRes.json() : { data: [] };

        return {
            templates: templates.data || [],
            tickets: tickets.data || [],
        };
    } catch (error) {
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
