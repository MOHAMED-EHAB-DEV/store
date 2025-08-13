import React from "react";
import LayoutContainer from "@/components/Dashboard/Layout/LayoutContainer";
import {authenticateUser} from "@/middleware/auth";
import {redirect} from "next/navigation";

export const dynamic = "force-dynamic";


export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    const user = authenticateUser();

    if (!user) redirect("/");
    return (
        <LayoutContainer user={user}>
            {children}
        </LayoutContainer>
    )
}