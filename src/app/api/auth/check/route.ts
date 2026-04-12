import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse<{ authenticated: boolean }>> {
  try {
    const authenticated = await isAuthenticated();

    return NextResponse.json({ authenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
