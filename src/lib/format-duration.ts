/**
 * Normalizes a video duration string into a consistent "H:MM:SS" or "M:SS" format.
 *
 * Supported inputs:
 *   - Bare seconds: "3" -> "0:03", "45" -> "0:45"
 *   - Unpadded colon format: "0:8" -> "0:08"
 *   - Already correct colon format: "3:45" -> "3:45", "1:02:03" -> "1:02:03"
 *   - Leading-zero minutes: "03:45" -> "3:45"
 *   - ISO 8601 duration: "PT3M45S" -> "3:45", "PT15S" -> "0:15", "PT1H2M3S" -> "1:02:03"
 *   - Empty string: "" -> ""
 */
export function formatDuration(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return "";
  }

  const totalSeconds = parseToSeconds(trimmed);

  if (totalSeconds === null) {
    return trimmed;
  }

  return formatSeconds(totalSeconds);
}

function parseToSeconds(input: string): number | null {
  // ISO 8601 duration: PT1H2M3S, PT3M45S, PT15S, etc.
  const isoMatch = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(input);

  if (isoMatch !== null) {
    const hours = parseInt(isoMatch[1] ?? "0", 10);
    const minutes = parseInt(isoMatch[2] ?? "0", 10);
    const seconds = parseInt(isoMatch[3] ?? "0", 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Colon-separated: "H:MM:SS", "M:SS", or "SS"
  const parts = input.split(":");

  if (parts.length === 1) {
    // Bare seconds: "3", "45"
    const seconds = parseInt(parts[0], 10);
    return Number.isNaN(seconds) ? null : seconds;
  }

  if (parts.length === 2) {
    // M:SS
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return null;
    }

    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    // H:MM:SS
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return null;
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    const paddedMinutes = String(minutes).padStart(2, "0");
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}
