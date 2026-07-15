"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Mail } from "@/components/ui/svgs/icons/Mail";
import { Lock } from "@/components/ui/svgs/icons/Lock";
import { User as UserIcon } from "@/components/ui/svgs/icons/User";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { EyeOff } from "@/components/ui/svgs/icons/EyeOff";
import { sonnerToast } from "@/components/ui/sonner";
import { Shield } from "@/components/ui/svgs/icons/Shield";
import { FileText } from "@/components/ui/svgs/icons/FileText";
import { Activity } from "@/components/ui/svgs/icons/Activity";
import { Input } from "@/components/ui/input";

interface StepWorkspaceProps {
  onSubmitComplete: () => void;
  isSubmittingTicket: boolean;
}

const StepWorkspace = ({
  onSubmitComplete,
  isSubmittingTicket,
}: StepWorkspaceProps) => {
  const { user, setReload } = useUser();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isLogin && !formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoadingAuth(true);

    try {
      const endpoint = isLogin ? "/api/user/login" : "/api/user/register";
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setReload();
        // Wait a tick for context to potentially update, then trigger ticket submission
        setTimeout(() => {
          onSubmitComplete();
        }, 500);
      } else {
        sonnerToast.error(
          data.message || `Failed to ${isLogin ? "login" : "register"}`,
        );
      }
    } catch (error) {
      sonnerToast.error("An error occurred during authentication");
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-center">
      <h3 className="text-2xl md:text-3xl font-bold mb-2 font-paras">
        Initialize Your Secure Client Workspace
      </h3>
      <p className="text-gray-400 mb-6 text-sm md:text-base">
        This creates your private project dashboard — a secure space for
        real-time chat, file sharing, and milestone tracking.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <Shield className="w-6 h-6 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">
            End-to-end encrypted chat
          </span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <FileText className="w-6 h-6 text-pink-400" />
          <span className="text-sm font-medium text-gray-300">
            Secure file sharing
          </span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <Activity className="w-6 h-6 text-orange-400" />
          <span className="text-sm font-medium text-gray-300">
            Live project tracking
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full">
        {user ? (
          <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-purple-400 font-bold">
                {user.name.charAt(0)}
              </span>
            </div>
            <h4 className="text-xl font-bold mb-2">
              Welcome back, {user.name}
            </h4>
            <p className="text-gray-400 text-sm mb-6">
              Your workspace is ready.
            </p>

            <button
              onClick={onSubmitComplete}
              disabled={isSubmittingTicket}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {isSubmittingTicket
                ? "Submitting Application..."
                : "Submit Application"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                isRequired
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                startContent={<UserIcon className="w-5 h-5 text-gray-400" />}
                classNames={{
                  inputWrapper: "bg-black/40 border-white/10 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all"
                }}
              />
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              isRequired
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              startContent={<Mail className="w-5 h-5 text-gray-400" />}
              classNames={{
                inputWrapper: "bg-black/40 border-white/10 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all"
              }}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              isRequired
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              startContent={<Lock className="w-5 h-5 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              classNames={{
                inputWrapper: "bg-black/40 border-white/10 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all"
              }}
            />

            <button
              type="submit"
              disabled={loadingAuth}
              className="w-full py-4 mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {loadingAuth
                ? "Authenticating..."
                : isLogin
                  ? "Login & Submit"
                  : "Create Workspace & Submit Application"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {isLogin
                  ? "Need an account? Create one"
                  : "Already have an account? Login instead"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StepWorkspace;
