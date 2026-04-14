import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getVideos, createItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch videos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const authenticated = await isAuthenticated(userAgent);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    if (!body.category || !["recent", "short", "long"].includes(body.category as string)) {
      return NextResponse.json({ success: false, error: "Valid category is required" }, { status: 400 });
    }

    const dataWithDefaults = {
      ...body,
      isVisible: body.isVisible ?? true,
      createdAt: body.createdAt ?? new Date().toISOString(),
      order: body.order ?? 0,
    };

    const id = await createItem("videos", dataWithDefaults);
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create video";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
