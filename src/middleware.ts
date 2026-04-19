import { NextRequest, NextResponse } from "next/server";

interface TokenParts {
  readonly payload: string;
  readonly timestamp: string;
  readonly nonce: string;
  readonly uaHash: string;
  readonly signature: string;
}

const SESSION_MAX_AGE_MS = 60 * 60 * 8 * 1000; // 8 hours in ms
const AUTH_COOKIE_NAME = "admin_session";
const NONCE_HEX_LENGTH = 64; // 32 bytes = 64 hex chars
const UA_HASH_LENGTH = 16; // first 16 chars of SHA-256 hex
const HEX_PATTERN = /^[0-9a-f]+$/;

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

function parseToken(token: string): TokenParts | null {
  // Split on last dot to get payload and signature
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) {
    return null;
  }

  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  // Payload must be timestamp:nonce:uaHash
  const payloadParts = payload.split(":");
  if (payloadParts.length !== 3) {
    // Old format (no colon) or invalid — reject
    return null;
  }

  const [timestamp, nonce, uaHash] = payloadParts;

  // Validate timestamp is a valid positive integer
  const timestampNum = Number(timestamp);
  if (!Number.isInteger(timestampNum) || timestampNum <= 0) {
    return null;
  }

  // Validate nonce is exactly 64 hex characters
  if (nonce.length !== NONCE_HEX_LENGTH || !HEX_PATTERN.test(nonce)) {
    return null;
  }

  // Validate uaHash length and format
  if (uaHash.length !== UA_HASH_LENGTH || !HEX_PATTERN.test(uaHash)) {
    return null;
  }

  return { payload, timestamp, nonce, uaHash, signature };
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and >= 32 chars");
  }

  const parts = parseToken(token);
  if (!parts) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Sign the full payload (timestamp:nonce:uaHash)
  const expectedSigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(parts.payload),
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

// Routes explicitly exempt from auth — must be an allowlist, not a blanket rule.
// Any route not listed here that starts with /api/ requires a valid session token.
const PUBLIC_GET_ROUTES: ReadonlySet<string> = new Set([
  "/api/videos",
  "/api/testimonials",
  "/api/services",
  "/api/pricing",
  "/api/faqs",
  "/api/site-config",
  "/api/youtube-meta",
]);

function isAuthExemptRoute(pathname: string, method: string): boolean {
  // Fast path: GET on exact public route — O(1) Set lookup before anything else.
  if (method === "GET" && PUBLIC_GET_ROUTES.has(pathname)) {
    return true;
  }

  // Auth endpoints handle their own flows; never block them here.
  if (pathname.startsWith("/api/auth/")) {
    return true;
  }

  // Public read-only content with trailing segment (e.g. /api/videos/123).
  if (method === "GET") {
    const routes = Array.from(PUBLIC_GET_ROUTES);
    for (let i = 0; i < routes.length; i++) {
      if (pathname.startsWith(routes[i] + "/")) {
        return true;
      }
    }
  }

  // Contact form — unauthenticated POST only.
  if (pathname === "/api/inquiries" && method === "POST") {
    return true;
  }

  return false;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  return response;
}

function methodNotAllowed(): NextResponse {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // --- HTTP method enforcement for auth endpoints ---
  if (pathname === "/api/auth/login") {
    if (method !== "POST") {
      return addSecurityHeaders(methodNotAllowed());
    }
  }

  if (pathname === "/api/auth/check") {
    if (method !== "GET") {
      return addSecurityHeaders(methodNotAllowed());
    }
  }

  if (pathname === "/api/auth/logout") {
    if (method !== "POST") {
      return addSecurityHeaders(methodNotAllowed());
    }
  }

  // --- Admin dashboard protection ---
  if (pathname.startsWith("/admin/dashboard")) {
    // Block iframe embedding via Sec-Fetch-Dest header
    const fetchDest = request.headers.get("sec-fetch-dest");
    if (fetchDest === "iframe") {
      return addSecurityHeaders(
        NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      );
    }

    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const valid = token ? await verifyToken(token) : false;
    if (!valid) {
      const loginUrl = new URL("/admin", request.url);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return addSecurityHeaders(response);
  }

  // --- API route protection ---
  if (pathname.startsWith("/api/")) {
    if (isAuthExemptRoute(pathname, method)) {
      return addSecurityHeaders(NextResponse.next());
    }
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const valid = token ? await verifyToken(token) : false;
    if (!valid) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      );
    }
    return addSecurityHeaders(NextResponse.next());
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/:path*"],
};
