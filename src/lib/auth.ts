import { cookies } from "next/headers";
import crypto from "crypto";

const AUTH_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

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

function signToken(timestamp: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(timestamp)
    .digest("hex");
}

export async function createSession(): Promise<void> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD environment variable is not configured");
  }

  const timestamp = Date.now().toString();
  const signature = signToken(timestamp, secret);
  const token = `${timestamp}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  if (!session?.value) {
    return false;
  }

  const parts = session.value.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [timestamp, signature] = parts;
  const expectedSignature = signToken(timestamp, secret);

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  const isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  if (!isValid) {
    return false;
  }

  const tokenAge = Date.now() - Number(timestamp);
  return tokenAge < SESSION_MAX_AGE * 1000;
}
