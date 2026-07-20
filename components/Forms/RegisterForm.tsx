"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Mail } from "@/components/ui/svgs/icons/Mail";
import { Lock } from "@/components/ui/svgs/icons/Lock";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { EyeOff } from "@/components/ui/svgs/icons/EyeOff";
import { User } from "@/components/ui/svgs/icons/User";
import { Check } from "@/components/ui/svgs/icons/Check";
import { useRouter } from "next/navigation";
import { passwordRequirements } from "@/constants/auth";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
    if (!agreed) {
      alert("Please agree to the terms and conditions");
      return;
    }
    setLoading(true);

    try {
      await fetch("/api/user/register", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }

    // const data = await response.json();
    // // console.log(data);

    // Redirect to OTP verification with email
    // navigate("/verify-email", { state: { email: formData.email } });

    // Redirect to Main Page
    setReload();
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        startContent={<User className="w-5 h-5 text-gray-400" />}
        placeholder="Enter your full name"
        isRequired
      />

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

      <div>
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
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          placeholder="Create a strong password"
          isRequired
          isInvalid={!!formData.password && formData.password.length < 8}
          errorMessage="Password must be at least 8 characters"
        />

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

      <Input
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        startContent={<Lock className="w-5 h-5 text-gray-400" />}
        endContent={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={showConfirmPassword ? "Hide Confirm Password" : "Show Confirm Password"}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        }
        placeholder="Confirm your password"
        isRequired
        isInvalid={!!formData.confirmPassword && formData.password !== formData.confirmPassword}
        errorMessage="Passwords don't match"
      />

      <label className="flex items-center" htmlFor="agree-terms">
        <input
          type="checkbox"
          id="agree-terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 rounded border-gray-600 text-gold focus:ring-gold focus:ring-offset-0 bg-transparent mt-1"
          required
        />
        <span className="ml-2 text-sm text-gray-300">
          I agree to the{" "}
          <Link
            href="/terms-of-service"
            className="text-gold hover:text-yellow-400"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-gold hover:text-yellow-400"
          >
            Privacy Policy
          </Link>
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || formData.password !== formData.confirmPassword}
        className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
            Creating account...
          </div>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
};
export default RegisterForm;
