import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getServices, createItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { ApiResponse, Service } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<Service[]>>> {
  try {
    const includeHidden = await isAuthenticated();
    const services = await getServices(includeHidden);

    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch services";
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

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json({ success: false, error: "Description is required" }, { status: 400 });
    }

    const dataWithDefaults = {
      ...body,
      isVisible: body.isVisible ?? true,
      createdAt: body.createdAt ?? new Date().toISOString(),
      order: body.order ?? 0,
    };

    const id = await createItem("services", dataWithDefaults);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create service";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
