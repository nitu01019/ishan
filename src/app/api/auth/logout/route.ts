import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function POST(): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await destroySession();

    return NextResponse.json({ success: true, data: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
