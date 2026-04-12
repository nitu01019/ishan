"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-400 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-text-secondary mb-8">
          We hit an unexpected error. Please try again or reload the page.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <p className="text-red-400 text-sm mb-6 font-mono bg-white/5 rounded-lg px-4 py-2 break-words">
            {error.message}
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
