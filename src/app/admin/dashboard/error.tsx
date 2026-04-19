'use client';
import { useEffect } from 'react';
export default function AdminDashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold">Admin dashboard error</h2>
      <p className="text-sm text-gray-500">Something went wrong in the admin panel.</p>
      <button onClick={reset} className="rounded bg-black px-4 py-2 text-white">Try again</button>
    </div>
  );
}
