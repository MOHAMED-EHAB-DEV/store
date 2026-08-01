"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ConciergeWidget = dynamic(() => import("@/components/ai/ConciergeWidget"), {
  ssr: false,
});

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && <ConciergeWidget />}
    </>
  );
}


