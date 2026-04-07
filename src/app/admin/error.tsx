"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Error</h2>
        <p className="text-text-secondary mb-2">Something went wrong in the admin panel.</p>
        <p className="text-red-400 text-sm mb-8 font-mono">{error.message}</p>
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
