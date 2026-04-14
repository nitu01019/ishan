/**
 * In-memory IP-based rate limiter for login endpoint.
 *
 * Escalating lockout tiers:
 *   - 5 failures in 15 min  -> locked 15 min
 *   - 10 failures in 1 hour -> locked 1 hour
 *   - 20 failures in 1 hour -> locked 24 hours (likely automated attack)
 *
 * Stale entries are cleaned up every 10 minutes to prevent memory leaks.
 */

interface AttemptRecord {
  /** Timestamps (ms) of each failed attempt. */
  readonly timestamps: readonly number[];
  /** If set, the IP is locked out until this time (ms). */
  readonly lockedUntil: number | null;
}

interface RateLimitResult {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

const MAX_ENTRY_AGE_MS = TWENTY_FOUR_HOURS_MS;

/** Map of IP -> attempt record. Never mutate entries; always replace. */
const attempts = new Map<string, AttemptRecord>();

/** Periodic cleanup to evict stale entries and avoid unbounded growth. */
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  const keys = Array.from(attempts.keys());
  for (const ip of keys) {
    const record = attempts.get(ip);
    if (!record) continue;
    const hasRecentTimestamp = record.timestamps.some(
      (ts: number) => now - ts < MAX_ENTRY_AGE_MS,
    );
    const isStillLocked =
      record.lockedUntil !== null && record.lockedUntil > now;

    if (!hasRecentTimestamp && !isStillLocked) {
      attempts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow Node to exit even if the timer is still active.
if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
  cleanupTimer.unref();
}

function getRecord(ip: string): AttemptRecord {
  return attempts.get(ip) ?? { timestamps: [], lockedUntil: null };
}

/**
 * Check whether the given IP is allowed to attempt a login.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const record = getRecord(ip);

  // If currently locked out, report remaining seconds.
  if (record.lockedUntil !== null && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Record a failed login attempt for the given IP and apply escalating lockouts.
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = getRecord(ip);

  // Append the new timestamp immutably.
  const updatedTimestamps = [...record.timestamps, now];

  // Count failures within the relevant windows.
  const failuresInLastHour = updatedTimestamps.filter(
    (ts) => now - ts < ONE_HOUR_MS,
  ).length;
  const failuresInLast15Min = updatedTimestamps.filter(
    (ts) => now - ts < FIFTEEN_MINUTES_MS,
  ).length;

  // Determine lockout duration (check highest tier first).
  let lockedUntil: number | null = null;

  if (failuresInLastHour >= 20) {
    lockedUntil = now + TWENTY_FOUR_HOURS_MS;
  } else if (failuresInLastHour >= 10) {
    lockedUntil = now + ONE_HOUR_MS;
  } else if (failuresInLast15Min >= 5) {
    lockedUntil = now + FIFTEEN_MINUTES_MS;
  }

  attempts.set(ip, {
    timestamps: updatedTimestamps,
    lockedUntil,
  });
}

/**
 * Reset all failed attempts for an IP (call on successful login).
 */
export function resetAttempts(ip: string): void {
  attempts.delete(ip);
}
