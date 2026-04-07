import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import type { ApiResponse } from "@/types";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ url: string }>>> {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 500MB." },
        { status: 413 }
      );
    }

    const url = await uploadFile(file);

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Firebase Storage is not configured. Add Firebase credentials to .env.local" },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, data: { url } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
