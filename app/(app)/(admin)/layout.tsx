import LayoutContainer from "@/components/Admin/Layout/LayoutContainer";
import { authenticateUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await authenticateUser(true, false, false, true);

  if (!user || user?.role !== "admin") redirect("/");
  return <LayoutContainer user={user}>{children}</LayoutContainer>;
}
