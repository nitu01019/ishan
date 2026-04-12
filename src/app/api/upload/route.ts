import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import type { ApiResponse } from "@/types";

/**
 * Server-side upload fallback.
 *
 * For large files (videos, 4K footage, etc.) the browser should use the
 * direct Supabase upload in `upload-manager.ts` which bypasses this route
 * entirely and provides progress tracking + cancel support.
 *
 * This route handles small files (< ~4 MB) as a fallback.
 */

// Allow up to 60s for slow uploads on serverless (App Router segment config).
export const maxDuration = 60;
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB (server route for small files only)

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ url: string }>>> {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body too large for server upload. Use direct upload for files over 4 MB.",
        },
        { status: 413 },
      );
    }

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large for server upload (${Math.round(file.size / (1024 * 1024))} MB). Large files are uploaded directly to storage.`,
        },
        { status: 413 },
      );
    }

    const url = await uploadFile(file);

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "Storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true, data: { url } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
