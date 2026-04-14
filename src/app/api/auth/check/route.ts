import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { isAuthenticated } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse<{ authenticated: boolean }>> {
  try {
    const requestHeaders = await headers();
    const userAgent = requestHeaders.get("user-agent") || "";
    const authenticated = await isAuthenticated(userAgent);

    return NextResponse.json({ authenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
