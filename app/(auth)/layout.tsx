import {ReactNode} from 'react';
import {authenticateUser} from "@/middleware/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
    const user = await authenticateUser();

    if (user) redirect("/");
    return (
        <div>
            {children}
        </div>
    )
}