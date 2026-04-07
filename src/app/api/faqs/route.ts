import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getFAQs, createItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { ApiResponse, FAQ } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<FAQ[]>>> {
  try {
    const includeHidden = await isAuthenticated();
    const faqs = await getFAQs(includeHidden);

    return NextResponse.json({ success: true, data: faqs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch FAQs";
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

    if (!body.question || typeof body.question !== "string") {
      return NextResponse.json({ success: false, error: "Question is required" }, { status: 400 });
    }
    if (!body.answer || typeof body.answer !== "string") {
      return NextResponse.json({ success: false, error: "Answer is required" }, { status: 400 });
    }

    const dataWithDefaults = {
      ...body,
      isVisible: body.isVisible ?? true,
      createdAt: body.createdAt ?? new Date().toISOString(),
      order: body.order ?? 0,
    };

    const id = await createItem("faqs", dataWithDefaults);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create FAQ";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
