"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const logError = async () => {
      try {
        await fetch("/api/error-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message:
              error.message || "An unexpected client-side error occurred",
            stack: error.stack,
            digest: error.digest,
            route: window.location.pathname,
          }),
        });
      } catch (err) {
        // Silent Fail
      }
    };

    logError();
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4">
      <div className="text-center max-w-xl w-full">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-8">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
          Something went wrong
        </h1>

        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          We've encountered an unexpected error. Our team has been notified and
          we're working on a fix.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => reset()}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 border border-white/5"
          >
            Return Home
          </Link>
        </div>

        <div className="w-full border border-white/5 rounded-2xl bg-white/5 overflow-hidden transition-all duration-300">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex items-center justify-between text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium">Technical Details</span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showDetails && (
            <div className="px-6 pb-6 text-left">
              <div className="p-4 bg-black/40 rounded-lg font-mono text-xs text-red-400/80 break-words overflow-auto max-h-60 border border-red-500/10">
                <p className="mb-2 font-bold text-red-400 underline uppercase tracking-wider">
                  Error Message:
                </p>
                <p className="mb-4">{error.message}</p>

                {error.digest && (
                  <>
                    <p className="mb-2 font-bold text-red-400 underline uppercase tracking-wider">
                      Error Digest:
                    </p>
                    <p className="mb-4">{error.digest}</p>
                  </>
                )}

                {error.stack && (
                  <>
                    <p className="mb-2 font-bold text-red-400 underline uppercase tracking-wider">
                      Stack Trace:
                    </p>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
