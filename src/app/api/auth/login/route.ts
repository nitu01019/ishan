import { NextResponse } from "next/server";

import { validatePassword, createSession } from "@/lib/auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetAttempts,
} from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

export const runtime = 'nodejs';

/**
 * Extract the client IP from standard proxy headers with a safe fallback.
 */
function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; first entry is the client.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Return a random delay between min and max milliseconds (inclusive).
 */
function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const ip = getClientIp(request);

    // --- Rate-limit check (before any password work) ---
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    const body = await request.json() as { password?: string; website?: string };

    // --- Honeypot check: silently reject bots that fill hidden fields ---
    if (body.website) {
      // Behave exactly like a wrong-password response so bots learn nothing.
      await randomDelay(500, 1500);
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!body.password || typeof body.password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 },
      );
    }

    const isValid = await validatePassword(body.password);

    if (!isValid) {
      recordFailedAttempt(ip);
      // Random delay to slow timing attacks and automated scripts.
      await randomDelay(500, 1500);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Successful login: clear the failure counter for this IP.
    resetAttempts(ip);

    const userAgent = request.headers.get("user-agent") || "";
    await createSession(userAgent);

    return NextResponse.json({ success: true, data: null });
  } catch (error: unknown) {
    // Generic message — never reveal internal details.
    void error;
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 500 },
    );
  }
}
