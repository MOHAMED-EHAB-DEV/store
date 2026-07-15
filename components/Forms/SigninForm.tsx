"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Mail } from "@/components/ui/svgs/icons/Mail";
import { Lock } from "@/components/ui/svgs/icons/Lock";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { EyeOff } from "@/components/ui/svgs/icons/EyeOff";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";

const SigninForm = ({ queryMessage, queryURL }: { queryMessage: String, queryURL: string }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        type: queryMessage === "unauthorized" ? "error" : "",
        content: queryMessage === "unauthorized" ? "Please, Login First" : ""
    });
    const { setReload } = useUser();

    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const response = await fetch("/api/user/login", {
            method: "POST",
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            })
        });
        setLoading(false);

        const data = await response.json();

        if (data?.success) {
            setReload();
            router.push(queryURL || '/');
        } else {
            if (response.status === 423) {
                setMessage({
                    type: "Error",
                    content: data.message
                });
            } else if (response.status === 403) {
                setMessage({
                    type: "Error",
                    content: data.message,
                });

                setTimeout(() => {
                    setMessage({
                        type: "",
                        content: "",
                    });
                }, 7000);

                router.push("/banned");
            } else {
                setMessage({
                    type: "Error",
                    content: data.message,
                });

                setTimeout(() => {
                    setMessage({
                        type: "",
                        content: "",
                    });
                }, 7000);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message.content && (
                <div
                    className={`mb-4 p-4 text-center rounded bg-red-600 text-red-50`}
                >
                    {message.content}
                </div>
            )}
            <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                startContent={<Mail className="w-5 h-5 text-gray-400" />}
                placeholder="Enter your email"
                isRequired
                isInvalid={!!formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                errorMessage="Please enter a valid email address"
            />

            <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                startContent={<Lock className="w-5 h-5 text-gray-400" />}
                endContent={
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide Current Password" : "Show Current Password"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                }
                placeholder="Enter your password"
                isRequired
                isInvalid={!!formData.password && formData.password.length < 6}
                errorMessage="Password must be at least 6 characters"
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div
                            className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                        Logging in...
                    </div>
                ) : (
                    "Login"
                )}
            </button>
        </form>
    )
}
export default SigninForm;
