import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { updateItem, deleteItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { serviceUpdateSchema } from "@/lib/validation/admin-schemas";
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
    const userAgent = request.headers.get("user-agent") || "";
    const authenticated = await isAuthenticated(userAgent);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const parsed = serviceUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    await updateItem("services", id, parsed.data);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: null });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const authenticated = await isAuthenticated(userAgent);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteItem("services", id);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: null });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
