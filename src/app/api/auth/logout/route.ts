import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await destroySession();

    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
