import Logo from "@/components/ui/Logo";
import SigninForm from "@/components/Forms/SigninForm";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";

import { buildMetadata } from "@/lib/seo";

// TODO: upload screenshots for this page
export const metadata = buildMetadata({
  title: "Login | MHD Store Premium Templates",
  description: "Sign in to your MHD Store account to access your premium templates.",
  path: "/login",
  noIndex: true,
  screenshotName: "login",
});

const Page = async ({
  searchParams,
}: {
  searchParams: { message: string, url: string };
}) => {
  const { message, url } = await searchParams;
  return (
    <div className="min-h-screen h-full min-w-screen flex flex-col gap-4 items-center justify-center">
      <Link
        href="/"
        className="inline-flex items-center left-1/2 text-gray-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <div className="flex flex-col items-center p-6 justify-center bg-dark/70 border border-dark backdrop-blur-lg rounded-lg gap-4">
        <div className="flex flex-col items-center justify-center gap-1">
          <Logo />
          <h1 className="text-white text-4xl font-bold">Login</h1>
        </div>

        <SigninForm queryMessage={message} queryURL={url} />
        <div>
          Don't have an account?{" "}
          <Link href="/register" className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Page;
