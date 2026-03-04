import { ReactNode } from "react";
import { UserProvider } from "@/context/UserContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AnalyticsProvider>
      <UserProvider>{children}</UserProvider>
    </AnalyticsProvider>
  );
};
export default Providers;
