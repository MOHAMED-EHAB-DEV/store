import { ReactNode } from "react";
import { authenticateUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await authenticateUser(true);

  if (user) redirect("/");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6">
      {/* Dynamic Ambient Aurora Lighting Mesh */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Deep base */}
        <div className="absolute inset-0 bg-[#07080d]" />

        {/* Luminous floating aurora orbs */}
        <div
          className="absolute -top-40 start-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/25 via-pink-600/15 to-transparent rounded-full blur-[140px] animate-float"
        />
        <div
          className="absolute -bottom-32 -start-32 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "2.5s" }}
        />
        <div
          className="absolute top-1/3 -end-32 w-[450px] h-[450px] bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "5s" }}
        />

        {/* Tech Cyber Grid Background with Radial Mask */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)",
          }}
        />

        {/* Tactile Grain Overlay */}
        <div className="absolute inset-0 grain-overlay opacity-60 mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
