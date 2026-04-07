import { NextRequest, NextResponse } from "next/server";

interface TokenParts {
  readonly timestamp: string;
  readonly signature: string;
}

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 1000; // 24 hours in ms
const AUTH_COOKIE_NAME = "admin_session";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    return false;
  }

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) {
    return false;
  }

  const parts: TokenParts = {
    timestamp: token.slice(0, dotIndex),
    signature: token.slice(dotIndex + 1),
  };

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expectedSigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(parts.timestamp),
  );

  const expectedHex = Array.from(new Uint8Array(expectedSigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (!constantTimeEqual(parts.signature, expectedHex)) {
    return false;
  }

  const tokenAge = Date.now() - Number(parts.timestamp);
  return tokenAge >= 0 && tokenAge < SESSION_MAX_AGE_MS;
}

function isAuthExemptRoute(pathname: string, method: string): boolean {
  if (pathname.startsWith("/api/auth/")) {
    return true;
  }
  if (pathname === "/api/inquiries" && method === "POST") {
    return true;
  }
  // GET /api/inquiries requires auth (contains PII)
  if (pathname.startsWith("/api/inquiries") && method === "GET") {
    return false;
  }
  if (pathname.startsWith("/api/") && method === "GET") {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (pathname.startsWith("/admin/dashboard")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const valid = token ? await verifyToken(token) : false;
    if (!valid) {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (isAuthExemptRoute(pathname, method)) {
      return NextResponse.next();
    }
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const valid = token ? await verifyToken(token) : false;
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/:path*"],
};
