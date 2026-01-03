import { ReactNode } from 'react';
import { UserProvider } from "@/context/UserContext";

const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <UserProvider>
            {children}
        </UserProvider>
    )
}
export default Providers;