import { Metadata } from "next";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/Dashboard/SettingsClient";
import { authenticateUser } from "@/middleware/auth";

export const metadata: Metadata = {
    title: "Settings | Dashboard",
    description: "Manage your account settings and preferences",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const user = await authenticateUser(true, false, true);
    if (!user) redirect("/");

    return <SettingsClient user={user} />;
}