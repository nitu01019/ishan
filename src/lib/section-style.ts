import type { CSSProperties } from "react";
import type { SectionBackground } from "@/types";

/**
 * Converts a hex color string to an rgba() string with the given alpha.
 * Falls back to the original color if parsing fails.
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 3 && cleaned.length !== 6) return hex;

  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getSectionStyle(bg?: SectionBackground): CSSProperties {
  if (!bg) return {};

  const alpha = (bg.opacity ?? 100) / 100;

  switch (bg.type) {
    case "gradient": {
      const dir = bg.gradientDirection || "to bottom right";
      // Convert Tailwind-style direction shorthand to CSS if needed
      const cssDir = dir.startsWith("to-")
        ? dir.replace("to-", "to ").replace("br", "bottom right").replace("bl", "bottom left").replace("tr", "top right").replace("tl", "top left").replace("r", "right").replace("l", "left").replace("t", "top").replace("b", "bottom")
        : dir;

      // Incorporate opacity into the color stops instead of applying
      // it to the whole section element (which would also fade text).
      const from = hexToRgba(bg.gradientFrom, alpha);
      const to = hexToRgba(bg.gradientTo, alpha);

      return {
        background: `linear-gradient(${cssDir}, ${from}, ${to})`,
      };
    }
    case "image": {
      if (!bg.imageUrl) return {};
      // For images we can't bake opacity into the URL, so we keep the
      // property. Consumers that need opaque text should layer content
      // above the background via CSS (e.g. a pseudo-element overlay).
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: alpha,
      };
    }
    case "solid":
    default: {
      if (!bg.color) return {};
      return {
        backgroundColor: hexToRgba(bg.color, alpha),
      };
    }
  }
}
