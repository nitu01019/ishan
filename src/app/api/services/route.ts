import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getServices, createItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { serviceCreateSchema } from "@/lib/validation/admin-schemas";
import type { ApiResponse, Service } from "@/types";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse<ApiResponse<Service[]>>> {
  try {
    const requestHeaders = await headers();
    const userAgent = requestHeaders.get("user-agent") || "";
    const includeHidden = await isAuthenticated(userAgent);
    const services = await getServices(includeHidden);

    return NextResponse.json({ success: true, data: services });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const authenticated = await isAuthenticated(userAgent);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parsed = serviceCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const dataWithDefaults = {
      ...parsed.data,
      isVisible: parsed.data.isVisible ?? true,
      createdAt: parsed.data.createdAt ?? new Date().toISOString(),
      order: parsed.data.order ?? 0,
    };

    const id = await createItem("services", dataWithDefaults);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
