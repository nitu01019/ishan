import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getVideos, createItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { videoCreateSchema } from "@/lib/validation/admin-schemas";
import type { ApiResponse, Video } from "@/types";

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<Video[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const userAgent = request.headers.get("user-agent") || "";
    const includeHidden = await isAuthenticated(userAgent);
    const videos = await getVideos(category, includeHidden);

    return NextResponse.json({ success: true, data: videos });
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

    const parsed = videoCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const dataWithDefaults = {
      ...parsed.data,
      isVisible: parsed.data.isVisible ?? true,
      createdAt: parsed.data.createdAt ?? new Date().toISOString(),
      order: parsed.data.order ?? 0,
    };

    const id = await createItem("videos", dataWithDefaults);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
