import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSiteConfig, updateSiteConfig } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { ApiResponse, SiteConfig } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse<ApiResponse<SiteConfig>>> {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch site config";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    await updateSiteConfig(body);

    revalidatePath("/");

    return NextResponse.json({ success: true, data: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update config";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
