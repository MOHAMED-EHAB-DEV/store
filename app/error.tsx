'use client';

import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-black text-purple-400 mb-4">Oops!</h1>
                <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                <p className="text-gray-400 mb-8">
                    We encountered an unexpected error. Please try again or go back home.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
