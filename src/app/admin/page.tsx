'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [portfolioName, setPortfolioName] = useState("Neal's Portfolio");
  const disableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function fetchPortfolioName() {
      try {
        const res = await fetch('/api/site-config');
        const json = await res.json();
        const config = json.data;
        if (config) {
          const name =
            config.brandName ||
            config.navbar?.logoText ||
            config.footer?.name ||
            "Neal's Portfolio";
          setPortfolioName(name);
        }
      } catch {
        // Keep default on error
      }
    }

    fetchPortfolioName();

    // Cleanup the disable timer on unmount.
    return () => {
      if (disableTimerRef.current !== null) {
        clearTimeout(disableTimerRef.current);
      }
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const honeypot = formData.get('website');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...(honeypot ? { website: honeypot } : {}),
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/dashboard');
        return;
      }

      // Show rate-limit specific message on 429.
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After');
        const seconds = retryAfter ? parseInt(retryAfter, 10) : null;
        if (seconds && seconds > 60) {
          const minutes = Math.ceil(seconds / 60);
          setError(`Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
        } else {
          setError(data.error ?? 'Too many attempts. Please try again later.');
        }
      } else {
        setError(data.error ?? 'Invalid credentials. Please try again.');
      }

      // Disable submit button for 2 seconds after a failed attempt.
      setSubmitDisabled(true);
      disableTimerRef.current = setTimeout(() => {
        setSubmitDisabled(false);
        disableTimerRef.current = null;
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isButtonDisabled = loading || submitDisabled;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-card rounded-2xl p-8 shadow-card">
        <h1 className="font-heading text-2xl text-white text-center mb-2">
          {portfolioName}
        </h1>
        <p className="text-text-secondary text-sm text-center mb-8">
          Admin Login
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field — hidden from real users, auto-filled by bots */}
          <input
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
          />

          <div>
            <label
              htmlFor="password"
              className="block text-text-secondary text-sm mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white placeholder-text-muted focus:border-accent-green focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full bg-accent-green text-black font-semibold rounded-xl px-6 py-3 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
