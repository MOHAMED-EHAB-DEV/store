import React from "react";
import LayoutContainer from "@/components/Admin/Layout/LayoutContainer";
import {authenticateUser} from "@/middleware/auth";
import {redirect} from "next/navigation";

export default async function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    const user = await authenticateUser();

    if (!user) redirect("/signin");
    return (
        <LayoutContainer user={user}>
            {children}
        </LayoutContainer>
    )
}