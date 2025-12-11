import Link from "next/link";
import { ShieldAlert, Home, Mail } from "@/components/ui/svgs/Icons";
import { Metadata } from "next";
import { authenticateUser } from "@/middleware/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Account Banned | MHD Store",
    description: "Your account has been banned",
    robots: "noindex, nofollow"
};

export default async function BannedPage() {
    const user = await authenticateUser(true);

    if (!user || !user?.banned) redirect("/");
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <div className="max-w-2xl w-full">
                    <div className="glass rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl backdrop-blur-xl">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-red-500 to-pink-600 rounded-full p-6 shadow-lg">
                                    <ShieldAlert className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Account Banned
                        </h1>
                        <p className="text-center text-gray-300 text-lg mb-8 leading-relaxed">
                            Your account has been suspended due to a violation of our{" "}
                            <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                                Terms of Service
                            </Link>
                            . If you believe this is a mistake, please contact our support team.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-purple-400" />
                                Need Help?
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Our support team is here to help. Please reach out with your account details and we'll review your case as soon as possible.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                            >
                                <Home className="w-5 h-5" />
                                Return Home
                            </Link>
                            <Link
                                href="/support"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all duration-300 backdrop-blur-sm hover:scale-105"
                            >
                                <Mail className="w-5 h-5" />
                                Contact Support
                            </Link>
                        </div>

                        <p className="text-center text-gray-500 text-sm mt-8">
                            Ban ID: {user?.banId}
                        </p>
                    </div>

                    <div className="text-center mt-8 text-gray-400 text-sm">
                        <p>
                            All decisions are final and subject to our{" "}
                            <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                                Terms of Service
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
