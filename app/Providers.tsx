import { ReactNode } from "react";
import { UserProvider } from "@/context/UserContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";

import { Suspense } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <AnalyticsProvider>
        <UserProvider>{children}</UserProvider>
      </AnalyticsProvider>
    </Suspense>
  );
};
export default Providers;
