import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getPricing, createItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { ApiResponse, PricingPlan } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<PricingPlan[]>>> {
  try {
    const includeHidden = await isAuthenticated();
    const pricing = await getPricing(includeHidden);

    return NextResponse.json({ success: true, data: pricing });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch pricing";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;

    if (!body.planName || typeof body.planName !== "string") {
      return NextResponse.json({ success: false, error: "Plan name is required" }, { status: 400 });
    }
    if (typeof body.price !== "number" || body.price < 0) {
      return NextResponse.json({ success: false, error: "Price must be a number >= 0" }, { status: 400 });
    }
    if (!Array.isArray(body.features) || body.features.length === 0) {
      return NextResponse.json({ success: false, error: "Features must be a non-empty array" }, { status: 400 });
    }

    const dataWithDefaults = {
      ...body,
      isVisible: body.isVisible ?? true,
      createdAt: body.createdAt ?? new Date().toISOString(),
      order: body.order ?? 0,
    };

    const id = await createItem("pricing", dataWithDefaults);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create pricing plan";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
