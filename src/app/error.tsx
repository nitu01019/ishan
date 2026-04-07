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
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-text-secondary mb-8">
          We hit an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-accent-green text-black font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
