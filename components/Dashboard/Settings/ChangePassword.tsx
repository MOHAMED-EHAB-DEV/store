"use client";

import { useState, FormEvent } from 'react';
import { Check } from "@/components/ui/svgs/icons/Check";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { EyeOff } from "@/components/ui/svgs/icons/EyeOff";
import { Lock } from "@/components/ui/svgs/icons/Lock";
import { passwordRequirements } from "@/constants";
import { sonnerToast } from "@/components/ui/sonner";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalHeader,
    ModalTitle,
} from "@/components/ui/Modal";
import { whatLoseWhenDeleteMyAccount } from "@/constants";
import { Mail } from "@/components/ui/svgs/icons/Mail";
import { X } from "@/components/ui/svgs/icons/X";

const ChangePassword = () => {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Delete account states
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [deleteFormData, setDeleteFormData] = useState({
        email: "",
        currentPassword: "",
        confirmPassword: "",
    });

    const handleInputChange = ({ target: { name, value } }: { target: { name: string, value: string } }) =>
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

    const handleDeleteInputChange = ({ target: { name, value } }: { target: { name: string, value: string } }) =>
        setDeleteFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch("/api/user/password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user?.email,
                    password: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                sonnerToast.error(data.message || "Failed to change password");
                return;
            }

            sonnerToast.success("Password changed successfully");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            sonnerToast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsDeleteLoading(true);
        try {
            const response = await fetch("/api/user/delete-account", {
                method: "DELETE",
                body: JSON.stringify({
                    email: deleteFormData.email,
                    password: deleteFormData.currentPassword,
                })
            });

            const data = await response.json();

            if (data.success) {
                sonnerToast.success(data.message);
                router.push("/");
            } else {
                sonnerToast.error(data.message);
            }
        } catch (err) {
            sonnerToast.error((err as Error).message);
        } finally {
            setIsDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Change Password Section */}
            <form className="flex flex-col gap-4 rounded-lg" onSubmit={handleSubmit}>
                <h2 className="text-white font-bold text-2xl">Change Password</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
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
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            aria-label='Toggle password visibility'
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
                        New Password
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
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            aria-label="Toggle new password visibility"
                            onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
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
                                    className={`flex items-center text-sm ${req.met ? "text-green-400" : "text-gray-400"}`}
                                >
                                    <Check
                                        className={`w-4 h-4 mr-2 ${req.met ? "text-green-400" : "text-gray-600"}`}
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
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            aria-label='Toggle password visibility'
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

                <button
                    disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword}
                    className="self-end btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    aria-label="Submit New Password"
                >
                    {isLoading ? "Updating Password" : "Update Password"}
                </button>
            </form>

            {/* Danger Zone */}
            <div className="border border-white/10 w-full p-8 rounded-sm bg-transparent flex flex-col gap-4 mt-8">
                <h2 className="text-white font-bold text-2xl">Danger Zone</h2>
                <p className="text-secondary text-md font-medium">Delete your account permanently.</p>

                <button
                    type="button"
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-danger rounded-md w-fit cursor-pointer px-4 py-2 font-bold text-white border-none outline-none focus:outline-none"
                >
                    Delete your account
                </button>

                <Modal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <ModalContent className="bg-primary border-none w-full max-w-[900px] data-[state=open]:animate-in data-[state=closed]:animate-out max-h-[90vh] overflow-y-auto">
                        <ModalHeader className="gap-3">
                            <ModalTitle className="font-paras text-3xl">Delete Account</ModalTitle>
                            <ModalDescription className="text-md font-light">
                                Are you sure you want to delete your account? Before you proceed, understand what deleting your account means:
                            </ModalDescription>
                            <div className="flex justify-center flex-col gap-3">
                                {whatLoseWhenDeleteMyAccount.map((v, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <div className="rounded-full w-5 h-5 flex items-center justify-center bg-red-700/90 p-1">
                                            <X className="w-full h-full" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">{v}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium">If you are sure, confirm by using your credentials below:</p>
                            <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4 justify-center">
                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 z-20 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={deleteFormData.email}
                                            onChange={handleDeleteInputChange}
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20" />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={deleteFormData.currentPassword}
                                            onChange={handleDeleteInputChange}
                                            className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={deleteFormData.confirmPassword}
                                            onChange={handleDeleteInputChange}
                                            className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
                                            placeholder="Confirm your password"
                                            required
                                        />
                                    </div>
                                    {deleteFormData.confirmPassword &&
                                        deleteFormData.currentPassword !== deleteFormData.confirmPassword && (
                                            <p className="text-red-400 text-sm mt-2">
                                                Passwords don't match
                                            </p>
                                        )}
                                </div>

                                <button
                                    disabled={isDeleteLoading || deleteFormData.currentPassword !== deleteFormData.confirmPassword}
                                    className="self-end bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    type="submit"
                                >
                                    {isDeleteLoading ? "Deleting..." : "Confirm Delete"}
                                </button>
                            </form>
                        </ModalHeader>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
};

export default ChangePassword;