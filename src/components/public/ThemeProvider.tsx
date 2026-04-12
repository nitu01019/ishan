"use client";

import { useEffect } from "react";
import type { TypographyConfig, NavConfig } from "@/types";

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

function applyTypography(typography: TypographyConfig) {
  const root = document.documentElement;
  if (typography.headingFont) {
    root.style.setProperty("--font-heading", typography.headingFont);
  }
  if (typography.bodyFont) {
    root.style.setProperty("--font-body", typography.bodyFont);
  }
  if (typography.baseFontSize) {
    root.style.setProperty("--font-base-size", `${typography.baseFontSize}px`);
  }
  if (typography.headingScale) {
    root.style.setProperty("--heading-scale", String(typography.headingScale));
  }
}

function applyNavConfig(nav: NavConfig) {
  const root = document.documentElement;
  if (nav.opacity !== undefined) {
    root.style.setProperty("--nav-opacity", String(nav.opacity));
  }
}

interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly initialTheme?: ThemeColors;
  readonly typography?: TypographyConfig;
  readonly navConfig?: NavConfig;
}

export default function ThemeProvider({
  children,
  initialTheme,
  typography,
  navConfig,
}: ThemeProviderProps) {
  useEffect(() => {
    if (initialTheme) {
      applyTheme(initialTheme);
    }
    if (typography) {
      applyTypography(typography);
    }
    if (navConfig) {
      applyNavConfig(navConfig);
    }

    // If no initialTheme was provided server-side, fetch from API as fallback
    if (!initialTheme) {
      const loadTheme = async () => {
        try {
          const res = await fetch("/api/site-config");
          if (!res.ok) return;
          const data = await res.json();
          const theme = data.data?.theme ?? data.theme;
          if (theme) {
            applyTheme(theme);
          }
          const typo = data.data?.typography ?? data.typography;
          if (typo) {
            applyTypography(typo);
          }
          const nav = data.data?.navbar ?? data.navbar;
          if (nav) {
            applyNavConfig(nav);
          }
        } catch {
          // Silently fail — CSS defaults will apply
        }
      };
      loadTheme();
    }
  }, [initialTheme, typography, navConfig]);

  return <>{children}</>;
}
