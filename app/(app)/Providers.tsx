import { ReactNode, Suspense } from "react";
import { GlobalStoreInitializer } from "@/components/shared/GlobalStoreInitializer";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <GlobalStoreInitializer />
      {children}
    </Suspense>
  );
};

export default Providers;
