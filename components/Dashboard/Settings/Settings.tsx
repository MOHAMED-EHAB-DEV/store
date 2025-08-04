import {useState, memo} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {whatLoseWhenDeleteMyAccount} from "@/constants";
import {toast} from "sonner";
import {Eye, EyeOff, Lock, Mail, X} from "lucide-react";
import {useRouter} from "next/navigation";

const Settings = ({userId}: {userId: string}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);
    const [formData, setFormData] = useState({
        email: "",
        currentPassword: "",
        confirmPassword: "",
    });
    const router = useRouter();

    const handleInputChange = ({target: {name, value}}: { target: { name: string, value: string } }) =>
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

    const handleSubmit = async (e: FormEventHandler<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch("/api/user/delete-account", {
                method: "DELETE",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.currentPassword,
                })
            }).then((res) => res.json());

            if (response.success) {
                toast(response.message);
                router.push("/");
            } else {
                toast(response.message);
            }
        } catch (err) {
            console.log(err)
            toast(err)
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="border border-white/10 w-full p-8 rounded-sm bg-transparent flex flex-col gap-4">
            <h1 className="text-white font-bold text-3xl">Danger Zone</h1>
            <p className="text-secondary text-md font-medium">Delete your account.</p>

            <Dialog>
                <DialogTrigger>
                    <div className="bg-gradient-danger rounded-md w-fit cursor-pointer px-4 py-2 font-bold text-white">
                        Delete your account
                    </div>
                </DialogTrigger>
                <DialogContent className="bg-primary border-none w-[900px] data-[state=open]:animate-in data-[state=closed]:animate-out">
                    <DialogHeader className="gap-3">
                        <DialogTitle className="font-paras text-3xl">Delete account</DialogTitle>
                        <DialogDescription className="text-md font-light ">
                            Are you sure to delete your account? Before go, we want you to understand what deleting your account means
                        </DialogDescription>
                        <div className="flex justify-center flex-col gap-3">
                            {whatLoseWhenDeleteMyAccount.map((v, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <div className="rounded-full w-5 h-5 flex items-center justify-center bg-red-700/90 p-1">
                                        <X className="w-full h-full" />
                                    </div>
                                    <span className="text-sm font-stretch-75% text-secondary">{v}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-medium">If you are sure, confirm by using your credentials below:</p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2 justify-center">
                            <div>
                                <div className="relative w-4/5">
                                    <Mail className="absolute left-3 top-1/2 z-20 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="relative w-4/5">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20"/>
                                    <input
                                        type={isPasswordVisible ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                                        placeholder="Enter your current password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {isPasswordVisible ? (
                                            <EyeOff className="w-5 h-5"/>
                                        ) : (
                                            <Eye className="w-5 h-5"/>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="relative w-4/5">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20"/>
                                    <input
                                        type={isConfirmPasswordVisible ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {isConfirmPasswordVisible ? (
                                            <EyeOff className="w-5 h-5"/>
                                        ) : (
                                            <Eye className="w-5 h-5"/>
                                        )}
                                    </button>
                                </div>
                                {formData.confirmPassword &&
                                    formData.currentPassword !== formData.confirmPassword && (
                                        <p className="text-red-400 text-sm mt-2">
                                            Passwords don't match
                                        </p>
                                    )}
                            </div>

                            <button disabled={isLoading || formData.currentPassword !== formData.confirmPassword} className={`self-end btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed`} type="submit">
                                {isLoading ? "Confirming": "Confirm"}
                            </button>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
export default Settings;