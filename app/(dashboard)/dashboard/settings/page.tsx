import { Metadata } from "next";
import SettingsClient from "@/components/Dashboard/SettingsClient";

export const metadata: Metadata = {
  title: "Settings | Dashboard",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  return <SettingsClient />;
}
