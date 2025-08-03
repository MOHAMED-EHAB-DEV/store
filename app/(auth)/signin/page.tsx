import Logo from "@/components/ui/Logo";
import SigninForm from "@/components/Forms/SigninForm";
import Link from "next/link";

const Page = () => {
    return (
        <div className="min-h-screen h-full min-w-screen flex items-center justify-center">
            <div className="flex flex-col items-center p-6 justify-center bg-dark/70 border border-dark backdrop-blur-lg rounded-lg gap-4">
                <div className="flex flex-col items-center justify-center gap-1">
                    <Logo />
                    <h1 className="text-white text-4xl font-bold">Signin</h1>
                </div>

                <SigninForm />

                <div>Don't have an account? <Link href="/register" className="text-gradient-purple">Register Here</Link></div>
            </div>
        </div>
    )
}
export default Page
