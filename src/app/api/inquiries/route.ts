import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isAuthenticated } from "@/lib/auth";
import { getInquiries, createInquiry } from "@/lib/db";
import type { ApiResponse, Inquiry } from "@/types";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse<ApiResponse<Inquiry[]>>> {
  try {
    const requestHeaders = await headers();
    const userAgent = requestHeaders.get("user-agent") || "";
    const authenticated = await isAuthenticated(userAgent);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch inquiries";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await request.json();
    const { name, email, phone, projectType, budget, message, selectedPlan } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const validProjectTypes = ["short-form", "long-form", "thumbnail", "seo", "consulting", "other"] as const;
    const safeProjectType = validProjectTypes.includes(projectType as typeof validProjectTypes[number])
      ? (projectType as typeof validProjectTypes[number])
      : "other";

    const id = await createInquiry({
      name,
      email,
      phone: phone || "",
      projectType: safeProjectType,
      budget: budget || "",
      message,
      selectedPlan: selectedPlan || "",
    });

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
