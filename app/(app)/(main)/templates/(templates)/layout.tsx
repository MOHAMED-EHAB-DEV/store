import type { ReactNode } from "react";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";

export async function generateStaticParams() {
  try {
    await connectToDatabase();
    // Only generate pages for active templates
    const templates = await Template.find({ isActive: true }).select('_id').lean();

    return templates.map((template: any) => ({
      id: template._id.toString(),
    }));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error generating template static params (DB query failed):", error);
    return [];
  }
}

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
