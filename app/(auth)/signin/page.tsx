import Logo from "@/components/ui/Logo";
import SigninForm from "@/components/Forms/SigninForm";

const Page = () => {
    return (
        <div className="min-h-screen h-full min-w-screen flex items-center justify-center">
            <div className="flex flex-col items-center p-6 justify-center bg-dark/70 border border-dark backdrop-blur-lg rounded-lg gap-4">
                <div className="flex flex-col items-center justify-center gap-1">
                    <Logo />
                    <h1 className="text-white text-4xl font-bold">Signin</h1>
                </div>

                <SigninForm />
            </div>
        </div>
    )
}
export default Page
