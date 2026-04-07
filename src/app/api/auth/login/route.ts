import { NextResponse } from "next/server";

import { validatePassword, createSession } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function POST(request: Request): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const body = await request.json() as { password?: string };

    if (!body.password || typeof body.password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = await validatePassword(body.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    await createSession();

    return NextResponse.json({ success: true, data: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
