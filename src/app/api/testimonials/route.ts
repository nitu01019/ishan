import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getTestimonials, createItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { ApiResponse, Testimonial } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<Testimonial[]>>> {
  try {
    const includeHidden = await isAuthenticated();
    const testimonials = await getTestimonials(includeHidden);

    return NextResponse.json({ success: true, data: testimonials });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch testimonials";
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

    if (!body.clientName || typeof body.clientName !== "string") {
      return NextResponse.json({ success: false, error: "Client name is required" }, { status: 400 });
    }
    if (!body.quote || typeof body.quote !== "string") {
      return NextResponse.json({ success: false, error: "Quote is required" }, { status: 400 });
    }
    if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be a number between 1 and 5" }, { status: 400 });
    }

    const dataWithDefaults = {
      ...body,
      isVisible: body.isVisible ?? true,
      createdAt: body.createdAt ?? new Date().toISOString(),
      order: body.order ?? 0,
    };

    const id = await createItem("testimonials", dataWithDefaults);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create testimonial";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
