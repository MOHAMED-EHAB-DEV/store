import type { ReactNode } from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateStaticParams() {
  try {
    const response = await fetch(`${APP_URL}/api/templates`);

    if (!response.ok) return [];

    const data = await response.json();
    const templates = data.success ? data.data : [];

    return templates.map((template: any) => ({
      id: template._id.toString(),
    }));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error generating template static params:", error);
    return [];
  }
}

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
