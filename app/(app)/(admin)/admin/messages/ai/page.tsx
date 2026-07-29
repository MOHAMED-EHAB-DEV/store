import { Metadata } from "next";
import AdminAIChatsClient from "@/components/Admin/AdminAIChatsClient";

export const metadata: Metadata = {
  title: "AI Chat Assistant Logs | Admin",
  description: "Monitor user conversations, review AI actions, and manage IP bans/spammers.",
  robots: "noindex, nofollow",
};

export default function AdminAIChatsPage() {
  return <AdminAIChatsClient />;
}
