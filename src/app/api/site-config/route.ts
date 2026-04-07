import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { doc, setDoc } from "firebase/firestore";

import { getSiteConfig } from "@/lib/db";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { isAuthenticated } from "@/lib/auth";
import type { ApiResponse, SiteConfig } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<SiteConfig>>> {
  try {
    const config = await getSiteConfig();

    return NextResponse.json({ success: true, data: config });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch site config";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, "siteConfig", "main");
      await setDoc(docRef, body, { merge: true });
    }

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update config";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
