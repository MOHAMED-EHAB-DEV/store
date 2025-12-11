import React from "react";
import LayoutContainer from "@/components/Admin/Layout/LayoutContainer";
import { authenticateUser } from "@/middleware/auth";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    const user = await authenticateUser(true, false, true);
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!user || user?.role !== "admin") redirect("/");
    return (
        <LayoutContainer user={user} socketToken={token}>
            {children}
        </LayoutContainer>
    )
}