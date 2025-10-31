import { useState } from 'react';
import { Check, Eye, EyeOff, Lock } from "@/components/ui/svgs/Icons";
import { passwordRequirements } from "@/constants";
import { sonnerToast } from "@/components/ui/sonner";

const ChangePassword = ({ user }: { user: IUser }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleInputChange = ({ target: { name, value } }: { target: { name: string, value: string } }) =>
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));


    const handleSubmit = async (e: FormEventHandler<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch("/api/user/change-password", {
                method: "POST",
                body: JSON.stringify({
                    email: user?.email,
                    password: passwordData?.currentPassword,
                    newPassword: passwordData?.newPassword,
                })
            }).then((res) => res.json());

            if (!response?.success) {
                sonnerToast.error(response.message);
            } else
                sonnerToast.success("Password updated successfully!");

            return response;
        } catch (err) {
            // console.log(err);
            sonnerToast.error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="flex flex-col gap-4 border border-white/10 p-8 rounded-sm mt-12" onSubmit={handleSubmit}>
            <h1 className="text-white font-bold text-3xl">Change Password</h1>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20" />
                    <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
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
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20" />
                    <input
                        type={isNewPasswordVisible ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                        placeholder="Create a strong password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setIsNewPasswordVisible(!isPasswordVisible)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        {isNewPasswordVisible ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {passwordData.newPassword && (
                    <div className="mt-3 space-y-2">
                        {passwordRequirements(passwordData.newPassword).map((req, index) => (
                            <div
                                key={index}
                                className={`flex items-center text-sm ${req.met ? "text-green-400" : "text-gray-400"
                                    }`}
                            >
                                <Check
                                    className={`w-4 h-4 mr-2 ${req.met ? "text-green-400" : "text-gray-600"
                                        }`}
                                />
                                {req.text}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20" />
                    <input
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
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
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {passwordData.confirmPassword &&
                    passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-red-400 text-sm mt-2">
                            Passwords don't match
                        </p>
                    )}
            </div>

            <button disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword} className={`self-end btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed`} type="submit">
                {isLoading ? "Updating Password" : "Update Password"}
            </button>
        </form>
    )
}
export default ChangePassword;