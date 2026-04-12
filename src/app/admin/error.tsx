"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDev) {
      console.error("[Admin Error]", error);
    }
  }, [error, isDev]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Error</h2>
        <p className="text-text-secondary mb-2">Something went wrong in the admin panel.</p>
        {isDev && error.message ? (
          <p className="text-red-400 text-sm mb-8 font-mono bg-white/5 rounded-lg px-4 py-2 break-words">
            {error.message}
          </p>
        ) : (
          <p className="text-text-secondary text-sm mb-8">
            Please try again or contact support if the issue persists.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-accent-green text-black font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
