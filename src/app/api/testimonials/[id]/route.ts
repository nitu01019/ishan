import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { updateItem, deleteItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    await updateItem("testimonials", id, body);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update testimonial";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteItem("testimonials", id);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete testimonial";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
