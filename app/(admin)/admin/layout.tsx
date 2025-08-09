import React from "react";
import LayoutContainer from "@/components/Admin/Layout/LayoutContainer";

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <LayoutContainer>
            {children}
        </LayoutContainer>
    )
}