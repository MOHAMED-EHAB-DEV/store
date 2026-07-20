import LayoutContainer from "@/components/Dashboard/Layout/LayoutContainer";
import { authenticateUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await authenticateUser(true, false);

  if (!user) redirect("/");
  if (user.banned) redirect("/banned");

  return <LayoutContainer user={user}>{children}</LayoutContainer>;
}
