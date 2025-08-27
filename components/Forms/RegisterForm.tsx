"use client";

import {useState, ChangeEvent, FormEvent} from 'react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Check,
} from "@/components/ui/svgs/Icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {passwordRequirements} from "@/constants";
import {useUser} from "@/context/UserContext";

const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
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
        if (!agreed) {
            alert("Please agree to the terms and conditions");
            return;
        }
        setLoading(true);
        const response = await fetch("/api/user/register", {
            method: "POST",
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
                name: formData.name,
            })
        });
        setLoading(false);

        const data = await response.json();
        console.log(data);

        // Redirect to OTP verification with email
        // navigate("/verify-email", { state: { email: formData.email } });

        // Redirect to Main Page
        setReload(prev => !prev);
        router.push('/');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 backdrop-blur-sm transition-all duration-200 ${
                            formData.name 
                                ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500' 
                                : 'border-white/10 focus:ring-gold focus:border-transparent'
                        }`}
                        placeholder="Enter your full name"
                        required
                    />
                </div>
            </div>

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
                            formData.password && formData.password.length >= 8
                                ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500' 
                                : formData.password && formData.password.length < 8
                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                : 'border-white/10 focus:ring-gold focus:border-transparent'
                        }`}
                        placeholder="Create a strong password"
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

                {/* Password requirements */}
                {formData.password && (
                    <div className="mt-3 space-y-2">
                        {passwordRequirements(formData.password).map((req, index) => (
                            <div
                                key={index}
                                className={`flex items-center text-sm ${
                                    req.met ? "text-green-400" : "text-gray-400"
                                }`}
                            >
                                <Check
                                    className={`w-4 h-4 mr-2 ${
                                        req.met ? "text-green-400" : "text-gray-600"
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
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 backdrop-blur-sm transition-all duration-200 ${
                            formData.confirmPassword && formData.password === formData.confirmPassword
                                ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500' 
                                : formData.confirmPassword && formData.password !== formData.confirmPassword
                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                : 'border-white/10 focus:ring-gold focus:border-transparent'
                        }`}
                        placeholder="Confirm your password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label={showConfirmPassword ? "Hide Confirm Password" : "Show Confirm Password"}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5"/>
                        ) : (
                            <Eye className="w-5 h-5"/>
                        )}
                    </button>
                </div>
                {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                        <p className="text-red-400 text-sm mt-2">
                            Passwords don't match
                        </p>
                    )}
            </div>

            <label className="flex items-start" htmlFor="agree-terms">
                <input
                    id="agree-terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-gold focus:ring-gold focus:ring-offset-0 bg-transparent mt-1"
                    required
                />
                <span className="ml-2 text-sm text-gray-300">
                I agree to the{" "}
                    <Link href="/terms" className="text-gold hover:text-yellow-400">
                  Terms of Service
                </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-gold hover:text-yellow-400">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
                type="submit"
                disabled={loading || !agreed || formData.password !== formData.confirmPassword}
                className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div
                            className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                        Creating account...
                    </div>
                ) : (
                    "Create Account"
                )}
            </button>
        </form>
    )
}
export default RegisterForm
