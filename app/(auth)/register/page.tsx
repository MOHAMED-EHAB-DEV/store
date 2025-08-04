import Logo from "@/components/ui/Logo";
import RegisterForm from "@/components/Forms/RegisterForm";
import Link from "next/link";
import {ArrowLeft} from "@/components/ui/svgs/Icons";

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

                <div>Have an account? <Link href="/signin" className="text-gradient-purple">Signin Here</Link></div>
            </div>
        </div>
    )
}
export default Page
