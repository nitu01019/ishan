import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { updateItem, deleteItem } from "@/lib/db";
import { inquiryUpdateSchema } from "@/lib/validation/admin-schemas";
import type { ApiResponse } from "@/types";

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
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
    const parsed = inquiryUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    await updateItem("inquiries", id, parsed.data);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: null });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
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
    const parsed = inquiryUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    await updateItem("inquiries", id, parsed.data);
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
    await deleteItem("inquiries", id);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: null });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
