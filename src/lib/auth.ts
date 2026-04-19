import { cookies } from "next/headers";
import crypto from "crypto";

const AUTH_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours in seconds

const NONCE_HEX_LENGTH = 64; // 32 bytes = 64 hex chars
const UA_HASH_LENGTH = 16; // first 16 chars of SHA-256 hex

export async function validatePassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return false;
  }

  const inputBuffer = Buffer.from(password);
  const storedBuffer = Buffer.from(adminPassword);

  if (inputBuffer.length !== storedBuffer.length) {
    // Pad to equal length to avoid leaking length info, then compare
    const maxLength = Math.max(inputBuffer.length, storedBuffer.length);
    const paddedInput = Buffer.alloc(maxLength);
    const paddedStored = Buffer.alloc(maxLength);
    inputBuffer.copy(paddedInput);
    storedBuffer.copy(paddedStored);

    // Always run timingSafeEqual even when lengths differ
    crypto.timingSafeEqual(paddedInput, paddedStored);
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, storedBuffer);
}

function hashUserAgent(userAgent: string): string {
  return crypto
    .createHash("sha256")
    .update(userAgent)
    .digest("hex")
    .slice(0, UA_HASH_LENGTH);
}

function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export async function createSession(userAgent: string): Promise<void> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and >= 32 chars");
  }

  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(32).toString("hex");
  const uaHash = hashUserAgent(userAgent);
  const payload = `${timestamp}:${nonce}:${uaHash}`;
  const signature = signPayload(payload, secret);
  const token = `${payload}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "strict",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(userAgent: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and >= 32 chars");
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  if (!session?.value) {
    return false;
  }

  // Split into payload and signature on the last dot
  const dotIndex = session.value.lastIndexOf(".");
  if (dotIndex === -1) {
    return false;
  }

  const payload = session.value.slice(0, dotIndex);
  const signature = session.value.slice(dotIndex + 1);

  // Parse payload: must be timestamp:nonce:uaHash
  const payloadParts = payload.split(":");
  if (payloadParts.length !== 3) {
    // Old format (no colon) or invalid — reject, force re-login
    return false;
  }

  const [timestamp, nonce, uaHash] = payloadParts;

  // Validate timestamp is a valid positive integer
  const timestampNum = Number(timestamp);
  if (!Number.isInteger(timestampNum) || timestampNum <= 0) {
    return false;
  }

  // Validate nonce is exactly 64 hex characters
  if (nonce.length !== NONCE_HEX_LENGTH || !/^[0-9a-f]+$/.test(nonce)) {
    return false;
  }

  // Validate uaHash length
  if (uaHash.length !== UA_HASH_LENGTH || !/^[0-9a-f]+$/.test(uaHash)) {
    return false;
  }

  // Verify HMAC signature over the full payload
  const expectedSignature = signPayload(payload, secret);

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  const isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  if (!isValid) {
    return false;
  }

  // Verify User-Agent fingerprint matches
  const expectedUaHash = hashUserAgent(userAgent);
  if (uaHash !== expectedUaHash) {
    return false;
  }

  // Check session age
  const tokenAge = Date.now() - timestampNum;
  return tokenAge >= 0 && tokenAge < SESSION_MAX_AGE * 1000;
}
