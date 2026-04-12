import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface YouTubeMeta {
  readonly title: string | null;
  readonly duration: string | null;
  readonly thumbnailUrl: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a YouTube video ID from various URL formats:
 *   - youtube.com/watch?v=ID
 *   - youtube.com/embed/ID
 *   - youtube.com/v/ID
 *   - youtube.com/shorts/ID
 *   - youtu.be/ID
 */
function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

/**
 * Parse an ISO 8601 duration string into a human-readable format.
 *
 *   PT3M45S   -> "3:45"
 *   PT15S     -> "0:15"
 *   PT1H2M3S  -> "1:02:03"
 *   PT1H30M   -> "1:30:00"
 *   PT1H      -> "1:00:00"
 */
function parseIsoDuration(iso: string): string | null {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;

  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);

  if (hours === 0 && minutes === 0 && seconds === 0) return null;

  const pad = (n: number): string => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/**
 * Fetch the oEmbed endpoint to retrieve the video title.
 */
async function fetchOEmbed(videoId: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = (await res.json()) as Record<string, unknown>;
    return typeof data.title === "string" ? data.title : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the YouTube watch page HTML and extract the duration from either:
 *   1. <meta itemprop="duration" content="PT3M45S">
 *   2. JSON-LD script block containing "duration": "PT3M45S"
 */
async function fetchDurationFromPage(videoId: string): Promise<string | null> {
  try {
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Strategy 1: meta itemprop="duration"
    const metaMatch = html.match(
      /<meta\s+itemprop\s*=\s*"duration"\s+content\s*=\s*"(PT[^"]+)"/
    );
    if (metaMatch?.[1]) {
      const parsed = parseIsoDuration(metaMatch[1]);
      if (parsed) return parsed;
    }

    // Strategy 2: JSON-LD block
    const ldMatch = html.match(/"duration"\s*:\s*"(PT[^"]+)"/);
    if (ldMatch?.[1]) {
      const parsed = parseIsoDuration(ldMatch[1]);
      if (parsed) return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<YouTubeMeta>>> {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url || url.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: url" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Could not extract a YouTube video ID from the provided URL" },
        { status: 400 }
      );
    }

    // Fetch title and duration concurrently for speed
    const [title, duration] = await Promise.all([
      fetchOEmbed(videoId),
      fetchDurationFromPage(videoId),
    ]);

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return NextResponse.json({
      success: true,
      data: { title, duration, thumbnailUrl },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch YouTube metadata";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
