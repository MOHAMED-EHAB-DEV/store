import Logo from "@/components/ui/Logo";
import RegisterForm from "@/components/Forms/RegisterForm";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Register | MHD Store Premium Templates",
  description: "Create an account to purchase and download premium Next.js templates.",
  path: "/register",
  noIndex: true,
  screenshotName: "register",
});

const Page = () => {
  return (
    <div className="min-h-screen h-full min-w-screen flex gap-4 flex-col items-center justify-center">
      <Link
        href="/"
        className="inline-flex items-center -translate-x-30 text-gray-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <div className="flex flex-col items-center p-6 justify-center bg-dark/70 border border-dark backdrop-blur-lg rounded-lg gap-4">
        <div className="flex flex-col items-center justify-center gap-1">
          <Logo />
          <h1 className="text-white text-4xl font-bold">Register</h1>
        </div>

        <RegisterForm />
        <div>
          Already have an account?{" "}
          <Link href="/login" className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Page;
