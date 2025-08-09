import React from "react";
import LayoutContainer from "@/components/Dashboard/Layout/LayoutContainer";
import {authenticateUser} from "@/middleware/auth";
import {redirect} from "next/navigation";

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <LayoutContainer user={user}>
            {children}
        </LayoutContainer>
    )
}