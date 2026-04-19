/**
 * Supabase-backed IP rate limiter for the login endpoint.
 *
 * Windows (same as the previous in-memory limiter):
 *   - 5 failures in 15 min
 *   - 10 failures in 1 hour
 *   - 20 failures in 24 hours
 *
 * Design notes:
 *   - Uses the shared anon client. The `login_attempts` table has RLS policies
 *     allowing anon INSERT + SELECT only. UPDATE/DELETE are blocked, so
 *     attackers cannot rewrite history. A pg_cron job (running as superuser)
 *     purges rows older than 24h hourly.
 *   - All DB operations are wrapped with a 500ms timeout and fail-open — a
 *     Supabase outage must never lock legitimate admins out.
 */

import { supabase } from "./supabase";

const LOGIN_ATTEMPTS_TABLE = "login_attempts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const MAX_ATTEMPTS_15_MIN = 5;
const MAX_ATTEMPTS_1_HOUR = 10;
const MAX_ATTEMPTS_24_HOUR = 20;

/** Timeout for each Supabase round-trip. Above this we fail-open. */
const DB_TIMEOUT_MS = 500;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  readonly allowed: boolean;
  /** Seconds until the caller may retry. 0 when allowed. */
  readonly retryAfterSeconds: number;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/**
 * Race a promise against a timeout. Rejects with a timeout error after `ms`.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Supabase request exceeded ${ms}ms timeout`));
    }, ms);

    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}

/**
 * Log a rate-limiter DB error without leaking caller context. We use
 * console.error here intentionally — this runs server-side on a Next.js
 * route handler where stderr is the expected log sink.
 */
function logRateLimitError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  // eslint-disable-next-line no-console
  console.error(`[rate-limit] ${context}: ${message}`);
}

interface AttemptCounts {
  readonly in15Min: number;
  readonly in1Hour: number;
  readonly in24Hour: number;
}

/**
 * Count failed attempts for `ip` inside the 24h window, then derive the
 * 1h and 15m sub-counts from the same result set. This uses a single
 * round-trip instead of three.
 */
async function countAttempts(ip: string): Promise<AttemptCounts> {
  if (!supabase) {
    return { in15Min: 0, in1Hour: 0, in24Hour: 0 };
  }

  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS).toISOString();

  const query = supabase
    .from(LOGIN_ATTEMPTS_TABLE)
    .select("attempted_at")
    .eq("ip", ip)
    .gte("attempted_at", cutoff);

  const { data, error } = await withTimeout(query, DB_TIMEOUT_MS);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const now = Date.now();
  let in15Min = 0;
  let in1Hour = 0;

  for (const row of rows) {
    const ts = new Date(row.attempted_at as string).getTime();
    if (Number.isNaN(ts)) continue;
    const age = now - ts;
    if (age < FIFTEEN_MINUTES_MS) in15Min += 1;
    if (age < ONE_HOUR_MS) in1Hour += 1;
  }

  return {
    in15Min,
    in1Hour,
    in24Hour: rows.length,
  };
}

/**
 * Derive a retry-after window (seconds) based on which threshold was tripped.
 * Highest-tier lockout wins.
 */
function deriveRetryAfterSeconds(counts: AttemptCounts): number {
  if (counts.in24Hour >= MAX_ATTEMPTS_24_HOUR) {
    return Math.ceil(TWENTY_FOUR_HOURS_MS / 1000);
  }
  if (counts.in1Hour >= MAX_ATTEMPTS_1_HOUR) {
    return Math.ceil(ONE_HOUR_MS / 1000);
  }
  if (counts.in15Min >= MAX_ATTEMPTS_15_MIN) {
    return Math.ceil(FIFTEEN_MINUTES_MS / 1000);
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether `ip` is allowed to attempt a login right now.
 *
 * Fails open: if Supabase errors or times out, we allow the attempt and log
 * the error. Blocking legitimate admins because of a DB blip is worse than a
 * brief window of reduced brute-force protection.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    const counts = await countAttempts(ip);
    const retryAfterSeconds = deriveRetryAfterSeconds(counts);
    return {
      allowed: retryAfterSeconds === 0,
      retryAfterSeconds,
    };
  } catch (error: unknown) {
    logRateLimitError("checkRateLimit failed, failing open", error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Record a failed login attempt for `ip`. Fails open on DB error.
 */
export async function recordFailedAttempt(ip: string): Promise<void> {
  if (!supabase) return;
  try {
    const insert = supabase
      .from(LOGIN_ATTEMPTS_TABLE)
      .insert({ ip });

    const { error } = await withTimeout(insert, DB_TIMEOUT_MS);
    if (error) {
      throw new Error(error.message);
    }
  } catch (error: unknown) {
    logRateLimitError("recordFailedAttempt failed", error);
  }
}

/**
 * Clear recorded failures for `ip` on successful login.
 *
 * With the anon-key architecture, DELETE is blocked by RLS (no delete policy)
 * to prevent attackers from clearing their own tracks. The pg_cron job purges
 * rows older than 24h; within a window, stale failures naturally age out of
 * the 15-min / 1h buckets. Kept as a no-op so call sites don't change.
 */
export async function resetAttempts(_ip: string): Promise<void> {
  return;
}
