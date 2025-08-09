import Logo from "@/components/ui/Logo";
import SigninForm from "@/components/Forms/SigninForm";
import Link from "next/link";
import {ArrowLeft} from "@/components/ui/svgs/Icons";

const Page = () => {
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
                    <h1 className="text-white text-4xl font-bold">Signin</h1>
                </div>

                <SigninForm />
            </div>

            <div className="mt-4">Don't have an account? <Link href="/register" className="text-gradient-purple">Register Here</Link></div>
        </div>
    )
}
export default Page
