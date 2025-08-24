"use client";

import {useState, ChangeEvent, FormEvent} from 'react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
} from "@/components/ui/svgs/Icons";
import { useRouter } from "next/navigation";
import {useUser} from "@/context/UserContext";

const SigninForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const {setReload} = useUser();

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
            setReload(prev => !prev);
            router.push('/');
        } else {
            setError(true);
            setErrorMessage("Invalid email or password");

            setTimeout(() => {
                setError(false);
                setErrorMessage("");
            }, 7000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 backdrop-blur-sm transition-all duration-200 ${
                            formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                                ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500' 
                                : formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                : 'border-white/10 focus:ring-gold focus:border-transparent'
                        }`}
                        placeholder="Enter your email"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 backdrop-blur-sm transition-all duration-200 ${
                            formData.password && formData.password.length >= 6
                                ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500' 
                                : formData.password && formData.password.length < 6
                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                : 'border-white/10 focus:ring-gold focus:border-transparent'
                        }`}
                        placeholder="Enter your password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide Current Password" : "Show Current Password"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5"/>
                        ) : (
                            <Eye className="w-5 h-5"/>
                        )}
                    </button>
                </div>
            </div>

            <div className={`${error ? "flex" : "hidden"} rounded-md bg-red-800 border border-red-500 px-4 py-2 items-start`}>
                <span>{errorMessage}</span>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div
                            className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                        Signing in...
                    </div>
                ) : (
                    "Signin"
                )}
            </button>
        </form>
    )
}
export default SigninForm;
