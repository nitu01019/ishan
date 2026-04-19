import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSiteConfig, updateSiteConfig } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { siteConfigUpdateSchema } from "@/lib/validation/admin-schemas";
import type { ApiResponse, SiteConfig } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse<ApiResponse<SiteConfig>>> {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const authenticated = await isAuthenticated(userAgent);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parsed = siteConfigUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    await updateSiteConfig(parsed.data);

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, data: null });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
