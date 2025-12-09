'use client';

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
            <div className="text-center max-w-md">
                <h1 className="text-8xl font-black text-purple-400 mb-4">404</h1>
                <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
