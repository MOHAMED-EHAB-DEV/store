import Logo from "@/components/ui/Logo";
import RegisterForm from "@/components/Forms/RegisterForm";

export const dynamic = "force-dynamic";

const Page = () => {
    return (
        <div className="min-h-screen h-full min-w-screen flex items-center justify-center">
            <div className="flex flex-col items-center p-6 justify-center bg-dark/70 border border-dark backdrop-blur-lg rounded-lg gap-4">
                <div className="flex flex-col items-center justify-center gap-1">
                    <Logo />
                    <h1 className="text-white text-4xl font-bold">Register</h1>
                </div>

                <RegisterForm />
            </div>
        </div>
    )
}
export default Page
