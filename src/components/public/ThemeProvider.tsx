"use client";

import { useEffect } from "react";

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "";
  return `${r} ${g} ${b}`;
}

interface ThemeColors {
  readonly accentColor?: string;
  readonly accentTeal?: string;
  readonly accentCyan?: string;
  readonly bgPrimary?: string;
  readonly bgCard?: string;
  readonly bgCardAlt?: string;
  readonly textPrimary?: string;
  readonly textSecondary?: string;
}

const COLOR_MAP: Record<keyof ThemeColors, string> = {
  accentColor: "--accent-green-rgb",
  accentTeal: "--accent-teal-rgb",
  accentCyan: "--accent-cyan-rgb",
  bgPrimary: "--bg-primary-rgb",
  bgCard: "--bg-card-rgb",
  bgCardAlt: "--bg-card-alt-rgb",
  textPrimary: "--text-primary-rgb",
  textSecondary: "--text-secondary-rgb",
};

function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(COLOR_MAP)) {
    const hex = theme[key as keyof ThemeColors];
    if (hex) {
      const rgb = hexToRgb(hex);
      if (rgb) {
        root.style.setProperty(cssVar, rgb);
      }
    }
  }
}

interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly initialTheme?: ThemeColors;
}

export default function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  useEffect(() => {
    if (initialTheme) {
      applyTheme(initialTheme);
      return;
    }

    async function loadTheme() {
      try {
        const res = await fetch("/api/site-config");
        if (!res.ok) return;
        const data = await res.json();
        const theme = data.data?.theme ?? data.theme;
        if (theme) {
          applyTheme(theme);
        }
      } catch {
        // Silently fail — CSS defaults will apply
      }
    }
    loadTheme();
  }, [initialTheme]);

  return <>{children}</>;
}
