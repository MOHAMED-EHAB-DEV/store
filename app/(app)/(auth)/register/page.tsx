import Logo from "@/components/ui/Logo";
import RegisterForm from "@/components/Forms/RegisterForm";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Register | MHD Store Premium Templates",
  description: "Create an account to purchase and download premium Next.js templates.",
  path: "/register",
  screenshotName: "register",
});

const Page = () => {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm font-medium backdrop-blur-md transition-all duration-300 group hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        aria-label="Back to home page"
      >
        <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform duration-300" />
        Back to Home
      </Link>

      {/* Main Glass Card Container */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-[#0e1017]/85 border border-white/[0.12] backdrop-blur-2xl p-8 sm:p-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Soft Ambient Card Glow */}
        <div
          className="pointer-events-none absolute -top-24 -start-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -end-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center gap-2 mb-8">
          <Logo />
          <h1 className="text-3xl sm:text-4xl font-bold font-paras text-white tracking-tight mt-2">
            Create Account
          </h1>
          <p className="text-sm text-gray-400">
            Join developers and founders building modern web products
          </p>
        </div>

        <div className="relative z-10">
          <RegisterForm />
        </div>

        <div className="relative z-10 text-center mt-8 text-sm text-gray-400 pt-6 border-t border-white/[0.08]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:opacity-80 transition-opacity"
          >
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
