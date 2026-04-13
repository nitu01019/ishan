'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ThemeConfig, TypographyConfig, PreloaderConfig } from '@/types';
import SliderControl from '@/components/admin/SliderControl';
import SelectControl from '@/components/admin/SelectControl';

interface ColorField {
  readonly key: keyof ThemeConfig;
  readonly label: string;
  readonly description: string;
  readonly group: 'accent' | 'background' | 'text';
}

interface PresetTheme {
  readonly name: string;
  readonly swatch: string;
  readonly colors: ThemeConfig;
}

const COLOR_FIELDS: readonly ColorField[] = [
  { key: 'accentColor', label: 'Accent Color', description: 'Buttons, CTAs, active states, highlights', group: 'accent' },
  { key: 'accentTeal', label: 'Accent Teal', description: 'Secondary accent, gradients', group: 'accent' },
  { key: 'accentCyan', label: 'Accent Cyan', description: 'Tertiary accent, gradients', group: 'accent' },
  { key: 'bgPrimary', label: 'Background', description: 'Page background', group: 'background' },
  { key: 'bgCard', label: 'Card Background', description: 'Card surfaces', group: 'background' },
  { key: 'bgCardAlt', label: 'Card Alt', description: 'Input backgrounds, alt surfaces', group: 'background' },
  { key: 'textPrimary', label: 'Text Primary', description: 'Main text color', group: 'text' },
  { key: 'textSecondary', label: 'Text Secondary', description: 'Muted text', group: 'text' },
] as const;

const DEFAULT_THEME: ThemeConfig = {
  accentColor: '#00E676',
  accentTeal: '#00BFA5',
  accentCyan: '#26C6DA',
  bgPrimary: '#0B1120',
  bgCard: '#111827',
  bgCardAlt: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
};

const PRESET_THEMES: readonly PresetTheme[] = [
  {
    name: 'Emerald',
    swatch: '#00E676',
    colors: { ...DEFAULT_THEME },
  },
  {
    name: 'Ocean Blue',
    swatch: '#3B82F6',
    colors: {
      accentColor: '#3B82F6',
      accentTeal: '#2563EB',
      accentCyan: '#06B6D4',
      bgPrimary: '#0B1120',
      bgCard: '#111827',
      bgCardAlt: '#1E293B',
      textPrimary: '#FFFFFF',
      textSecondary: '#9CA3AF',
    },
  },
  {
    name: 'Purple Haze',
    swatch: '#A855F7',
    colors: {
      accentColor: '#A855F7',
      accentTeal: '#7C3AED',
      accentCyan: '#EC4899',
      bgPrimary: '#0F0720',
      bgCard: '#1A1033',
      bgCardAlt: '#2D1B4E',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
    },
  },
  {
    name: 'Sunset Orange',
    swatch: '#F97316',
    colors: {
      accentColor: '#F97316',
      accentTeal: '#EA580C',
      accentCyan: '#FBBF24',
      bgPrimary: '#1A0E05',
      bgCard: '#1F1510',
      bgCardAlt: '#2D1F15',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
    },
  },
  {
    name: 'Rose Red',
    swatch: '#F43F5E',
    colors: {
      accentColor: '#F43F5E',
      accentTeal: '#E11D48',
      accentCyan: '#FB7185',
      bgPrimary: '#1A0510',
      bgCard: '#1F1015',
      bgCardAlt: '#2D1520',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
    },
  },
] as const;

const HEADING_FONT_OPTIONS = [
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Lora', label: 'Lora' },
] as const;

const BODY_FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Source Sans 3', label: 'Source Sans 3' },
  { value: 'DM Sans', label: 'DM Sans' },
] as const;

const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
  baseFontSize: 16,
  headingScale: 1.0,
};

const DEFAULT_PRELOADER: PreloaderConfig = {
  enabled: true,
  loadingMessage: "Getting Neil's portfolio for you",
};

/** CSS variable names matching ThemeProvider.tsx exactly */
const CSS_VAR_MAP: Record<keyof ThemeConfig, string> = {
  accentColor: '--accent-green-rgb',
  accentTeal: '--accent-teal-rgb',
  accentCyan: '--accent-cyan-rgb',
  bgPrimary: '--bg-primary-rgb',
  bgCard: '--bg-card-rgb',
  bgCardAlt: '--bg-card-alt-rgb',
  textPrimary: '--text-primary-rgb',
  textSecondary: '--text-secondary-rgb',
};

function hexToSpacedRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return '0 0 0';
  }

  return `${r} ${g} ${b}`;
}

function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function safeHex(value: string, fallback: string): string {
  return isValidHex(value) ? value : fallback;
}

/** Apply CSS variables using the same names as ThemeProvider */
function applyCssVariables(theme: ThemeConfig): void {
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    const hex = theme[key as keyof ThemeConfig];
    if (hex) {
      root.style.setProperty(cssVar, hexToSpacedRgb(hex));
    }
  }
}

function applyTypographyCssVariables(typo: TypographyConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--font-heading', typo.headingFont);
  root.style.setProperty('--font-body', typo.bodyFont);
  root.style.setProperty('--font-base-size', `${typo.baseFontSize}px`);
  root.style.setProperty('--heading-scale', String(typo.headingScale));
}

function getActivePresetName(theme: ThemeConfig): string | null {
  const match = PRESET_THEMES.find((preset) =>
    COLOR_FIELDS.every((field) => preset.colors[field.key].toUpperCase() === theme[field.key].toUpperCase())
  );
  return match?.name ?? null;
}

/** Standalone live preview component driven entirely by inline styles */
function LivePreviewPanel({
  theme,
  typography,
}: {
  readonly theme: ThemeConfig;
  readonly typography: TypographyConfig;
}) {
  const bg = safeHex(theme.bgPrimary, '#0B1120');
  const card = safeHex(theme.bgCard, '#111827');
  const cardAlt = safeHex(theme.bgCardAlt, '#1E293B');
  const accent = safeHex(theme.accentColor, '#00E676');
  const teal = safeHex(theme.accentTeal, '#00BFA5');
  const cyan = safeHex(theme.accentCyan, '#26C6DA');
  const txtPrimary = safeHex(theme.textPrimary, '#FFFFFF');
  const txtSecondary = safeHex(theme.textSecondary, '#9CA3AF');
  const headingFont = `"${typography.headingFont}", serif`;
  const bodyFont = `"${typography.bodyFont}", sans-serif`;
  const baseFontSize = typography.baseFontSize;
  const headingScale = typography.headingScale;

  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{ backgroundColor: bg, fontFamily: bodyFont }}
    >
      <p className="text-xs px-4 py-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
        Live Preview
      </p>

      {/* Mini hero section */}
      <div className="p-4" style={{ backgroundColor: bg }}>
        <h3
          className="font-bold leading-tight"
          style={{
            color: txtPrimary,
            fontFamily: headingFont,
            fontSize: `${Math.round(baseFontSize * headingScale * 1.5)}px`,
          }}
        >
          Hero Heading
        </h3>
        <p
          className="mt-1.5 leading-relaxed"
          style={{ color: txtSecondary, fontFamily: bodyFont, fontSize: `${baseFontSize}px` }}
        >
          This is how body text will appear on your portfolio site.
        </p>
        <button
          className="mt-3 px-4 py-1.5 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: accent, color: bg }}
          type="button"
        >
          Call to Action
        </button>
      </div>

      {/* Mini card section */}
      <div className="px-4 pb-4 flex gap-2">
        <div className="flex-1 p-3 rounded-lg" style={{ backgroundColor: card }}>
          <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: cardAlt }} />
          <span className="text-xs font-medium" style={{ color: txtPrimary, fontFamily: headingFont }}>
            Card Title
          </span>
          <span className="block text-xs mt-0.5" style={{ color: txtSecondary, fontFamily: bodyFont }}>
            Card content
          </span>
        </div>
        <div className="flex-1 p-3 rounded-lg" style={{ backgroundColor: card }}>
          <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: cardAlt }} />
          <span className="text-xs font-medium" style={{ color: txtPrimary, fontFamily: headingFont }}>
            Card Title
          </span>
          <span className="block text-xs mt-0.5" style={{ color: txtSecondary, fontFamily: bodyFont }}>
            Card content
          </span>
        </div>
      </div>

      {/* Alt card with input area */}
      <div className="px-4 pb-4">
        <div className="rounded-lg p-3" style={{ backgroundColor: cardAlt }}>
          <span className="text-xs font-semibold block mb-1.5" style={{ color: txtPrimary }}>
            Input Area
          </span>
          <div
            className="rounded-md px-3 py-2 text-xs"
            style={{ backgroundColor: card, color: txtSecondary }}
          >
            Placeholder text...
          </div>
        </div>
      </div>

      {/* Typography comparison */}
      <div className="px-4 pb-4 space-y-2">
        <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Typography
        </p>
        <h4
          className="font-bold leading-tight"
          style={{
            color: txtPrimary,
            fontFamily: headingFont,
            fontSize: `${Math.round(baseFontSize * headingScale * 1.25)}px`,
          }}
        >
          Section Heading
        </h4>
        <p
          className="leading-relaxed"
          style={{ color: txtSecondary, fontFamily: bodyFont, fontSize: `${baseFontSize}px` }}
        >
          Body text at {baseFontSize}px with {typography.bodyFont}.
        </p>
        <p
          className="font-medium"
          style={{ color: accent, fontFamily: bodyFont, fontSize: `${Math.round(baseFontSize * 0.875)}px` }}
        >
          Accent link or highlight
        </p>
      </div>

      {/* Color accent indicators */}
      <div className="px-4 pb-4 flex gap-2">
        <div className="h-3 flex-1 rounded-full" style={{ backgroundColor: accent }} />
        <div className="h-3 flex-1 rounded-full" style={{ backgroundColor: teal }} />
        <div className="h-3 flex-1 rounded-full" style={{ backgroundColor: cyan }} />
      </div>

      {/* Gradient bar preview */}
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, ${teal} 50%, ${cyan} 100%)`,
        }}
      />
    </div>
  );
}

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeConfig>({ ...DEFAULT_THEME });
  const [typography, setTypography] = useState<TypographyConfig>({ ...DEFAULT_TYPOGRAPHY });
  const [preloader, setPreloader] = useState<PreloaderConfig>({ ...DEFAULT_PRELOADER });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/site-config');
        if (!res.ok) {
          throw new Error('Failed to fetch configuration.');
        }
        const data = await res.json();
        const savedTheme = data.data?.theme;

        if (savedTheme) {
          setTheme({
            accentColor: savedTheme.accentColor ?? DEFAULT_THEME.accentColor,
            accentTeal: savedTheme.accentTeal ?? DEFAULT_THEME.accentTeal,
            accentCyan: savedTheme.accentCyan ?? DEFAULT_THEME.accentCyan,
            bgPrimary: savedTheme.bgPrimary ?? DEFAULT_THEME.bgPrimary,
            bgCard: savedTheme.bgCard ?? DEFAULT_THEME.bgCard,
            bgCardAlt: savedTheme.bgCardAlt ?? DEFAULT_THEME.bgCardAlt,
            textPrimary: savedTheme.textPrimary ?? DEFAULT_THEME.textPrimary,
            textSecondary: savedTheme.textSecondary ?? DEFAULT_THEME.textSecondary,
          });
        }

        const savedTypography = data.data?.typography;
        if (savedTypography) {
          setTypography({
            headingFont: savedTypography.headingFont ?? DEFAULT_TYPOGRAPHY.headingFont,
            bodyFont: savedTypography.bodyFont ?? DEFAULT_TYPOGRAPHY.bodyFont,
            baseFontSize: savedTypography.baseFontSize ?? DEFAULT_TYPOGRAPHY.baseFontSize,
            headingScale: savedTypography.headingScale ?? DEFAULT_TYPOGRAPHY.headingScale,
          });
        }

        const savedPreloader = data.data?.preloader;
        if (savedPreloader) {
          setPreloader({
            enabled: savedPreloader.enabled ?? DEFAULT_PRELOADER.enabled,
            loadingMessage: savedPreloader.loadingMessage ?? DEFAULT_PRELOADER.loadingMessage,
          });
        }
      } catch {
        setError('Failed to load theme configuration.');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const updateColor = useCallback((key: keyof ThemeConfig, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleHexInput = useCallback((key: keyof ThemeConfig, value: string) => {
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (normalized.length <= 7) {
      setTheme((prev) => ({ ...prev, [key]: normalized }));
    }
  }, []);

  const updateTypography = useCallback(<K extends keyof TypographyConfig>(key: K, value: TypographyConfig[K]) => {
    setTypography((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updatePreloader = useCallback(<K extends keyof PreloaderConfig>(key: K, value: PreloaderConfig[K]) => {
    setPreloader((prev) => ({ ...prev, [key]: value }));
  }, []);

  function applyPreset(preset: PresetTheme) {
    setTheme({ ...preset.colors });
  }

  function handleReset() {
    setTheme({ ...DEFAULT_THEME });
    setTypography({ ...DEFAULT_TYPOGRAPHY });
    setPreloader({ ...DEFAULT_PRELOADER });
    setError('');
    setSuccess('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    const invalidFields = COLOR_FIELDS.filter((field) => !isValidHex(theme[field.key]));
    if (invalidFields.length > 0) {
      setError(`Invalid hex values: ${invalidFields.map((f) => f.label).join(', ')}`);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, typography, preloader }),
      });

      if (!res.ok) {
        throw new Error('Failed to save theme.');
      }

      applyCssVariables(theme);
      applyTypographyCssVariables(typography);
      setSuccess('Theme saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save theme. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const activePreset = getActivePresetName(theme);

  if (loading) {
    return <p className="text-text-secondary">Loading theme...</p>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left column: All settings/controls */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Theme Customization</h1>
          <p className="text-text-secondary text-sm mt-1">
            Customize your portfolio colors and appearance. Changes preview instantly on the right.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}
        {success && (
          <p className="text-accent-green text-sm mb-4">{success}</p>
        )}

        {/* Presets */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Presets</h2>
          <hr className="border-gray-700 mb-4" />
          <div className="flex flex-wrap gap-3">
            {PRESET_THEMES.map((preset) => {
              const isActive = activePreset === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? 'border-white ring-2 ring-white/30 text-white bg-bg-card-alt'
                      : 'border-gray-700 text-text-secondary hover:text-white hover:border-gray-500 hover:bg-bg-card-alt'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: preset.swatch }}
                  />
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Pickers */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Colors</h2>
          <hr className="border-gray-700 mb-4" />

          {/* Accent Colors */}
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">Accent Colors</p>
          <div className="space-y-4 mb-6">
            {COLOR_FIELDS.filter((f) => f.group === 'accent').map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                <input
                  type="color"
                  value={isValidHex(theme[field.key]) ? theme[field.key] : '#000000'}
                  onChange={(e) => updateColor(field.key, e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-lg [&::-moz-color-swatch]:border-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-white">{field.label}</span>
                  <span className="block text-xs text-text-secondary truncate">{field.description}</span>
                </div>
                <div
                  className="w-8 h-8 rounded-md border border-gray-600 shrink-0"
                  style={{ backgroundColor: safeHex(theme[field.key], '#000') }}
                />
                <input
                  type="text"
                  value={theme[field.key]}
                  onChange={(e) => handleHexInput(field.key, e.target.value)}
                  maxLength={7}
                  className={`w-28 bg-bg-card-alt border rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none transition-colors ${
                    isValidHex(theme[field.key])
                      ? 'border-gray-700 focus:border-accent-green'
                      : 'border-red-500 focus:border-red-400'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Background Colors */}
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">Backgrounds</p>
          <div className="space-y-4 mb-6">
            {COLOR_FIELDS.filter((f) => f.group === 'background').map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                <input
                  type="color"
                  value={isValidHex(theme[field.key]) ? theme[field.key] : '#000000'}
                  onChange={(e) => updateColor(field.key, e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-lg [&::-moz-color-swatch]:border-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-white">{field.label}</span>
                  <span className="block text-xs text-text-secondary truncate">{field.description}</span>
                </div>
                <div
                  className="w-8 h-8 rounded-md border border-gray-600 shrink-0"
                  style={{ backgroundColor: safeHex(theme[field.key], '#000') }}
                />
                <input
                  type="text"
                  value={theme[field.key]}
                  onChange={(e) => handleHexInput(field.key, e.target.value)}
                  maxLength={7}
                  className={`w-28 bg-bg-card-alt border rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none transition-colors ${
                    isValidHex(theme[field.key])
                      ? 'border-gray-700 focus:border-accent-green'
                      : 'border-red-500 focus:border-red-400'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Text Colors */}
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">Text</p>
          <div className="space-y-4">
            {COLOR_FIELDS.filter((f) => f.group === 'text').map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                <input
                  type="color"
                  value={isValidHex(theme[field.key]) ? theme[field.key] : '#000000'}
                  onChange={(e) => updateColor(field.key, e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-lg [&::-moz-color-swatch]:border-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-white">{field.label}</span>
                  <span className="block text-xs text-text-secondary truncate">{field.description}</span>
                </div>
                <div
                  className="w-8 h-8 rounded-md border border-gray-600 shrink-0"
                  style={{ backgroundColor: safeHex(theme[field.key], '#000') }}
                />
                <input
                  type="text"
                  value={theme[field.key]}
                  onChange={(e) => handleHexInput(field.key, e.target.value)}
                  maxLength={7}
                  className={`w-28 bg-bg-card-alt border rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none transition-colors ${
                    isValidHex(theme[field.key])
                      ? 'border-gray-700 focus:border-accent-green'
                      : 'border-red-500 focus:border-red-400'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Typography</h2>
          <hr className="border-gray-700 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SelectControl
              label="Heading Font"
              description="Font used for headings and titles"
              value={typography.headingFont}
              options={HEADING_FONT_OPTIONS}
              onChange={(value) => updateTypography('headingFont', value)}
            />
            <SelectControl
              label="Body Font"
              description="Font used for body text and paragraphs"
              value={typography.bodyFont}
              options={BODY_FONT_OPTIONS}
              onChange={(value) => updateTypography('bodyFont', value)}
            />
            <SliderControl
              label="Base Font Size"
              description="Default size for body text"
              value={typography.baseFontSize}
              min={14}
              max={20}
              step={1}
              unit="px"
              onChange={(value) => updateTypography('baseFontSize', value)}
            />
            <SliderControl
              label="Heading Scale"
              description="Multiplier applied to heading sizes"
              value={typography.headingScale}
              min={1.0}
              max={1.5}
              step={0.05}
              unit="x"
              onChange={(value) => updateTypography('headingScale', Number(value.toFixed(2)))}
            />
          </div>

          {/* Font Preview */}
          <div className="rounded-xl border border-gray-700 bg-bg-card-alt p-5 space-y-3">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Font Preview</p>
            <h3
              className="font-bold leading-tight"
              style={{
                fontFamily: `"${typography.headingFont}", serif`,
                fontSize: `${Math.round(typography.baseFontSize * typography.headingScale * 1.75)}px`,
                color: safeHex(theme.textPrimary, '#FFFFFF'),
              }}
            >
              The quick brown fox jumps
            </h3>
            <h4
              className="font-semibold leading-tight"
              style={{
                fontFamily: `"${typography.headingFont}", serif`,
                fontSize: `${Math.round(typography.baseFontSize * typography.headingScale * 1.25)}px`,
                color: safeHex(theme.textPrimary, '#FFFFFF'),
              }}
            >
              Over the lazy dog
            </h4>
            <p
              className="leading-relaxed"
              style={{
                fontFamily: `"${typography.bodyFont}", sans-serif`,
                fontSize: `${typography.baseFontSize}px`,
                color: safeHex(theme.textSecondary, '#9CA3AF'),
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-xs" style={{ color: safeHex(theme.textSecondary, '#9CA3AF') }}>
                Heading: {typography.headingFont}
              </span>
              <span className="text-xs" style={{ color: safeHex(theme.textSecondary, '#9CA3AF') }}>
                Body: {typography.bodyFont}
              </span>
              <span className="text-xs" style={{ color: safeHex(theme.textSecondary, '#9CA3AF') }}>
                Base: {typography.baseFontSize}px
              </span>
              <span className="text-xs" style={{ color: safeHex(theme.textSecondary, '#9CA3AF') }}>
                Scale: {typography.headingScale}x
              </span>
            </div>
          </div>
        </div>

        {/* Preloader Settings */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Preloader Settings</h2>
          <hr className="border-gray-700 mb-4" />
          <div className="space-y-5">
            {/* Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-medium text-white">Enabled</span>
                <span className="block text-xs text-text-secondary">Show loading animation on first visit</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preloader.enabled}
                onClick={() => updatePreloader('enabled', !preloader.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preloader.enabled ? 'bg-accent-green' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    preloader.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Loading Message */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">Loading Message</label>
              <span className="block text-xs text-text-secondary mb-2">Text displayed during the loading animation</span>
              <input
                type="text"
                value={preloader.loadingMessage}
                onChange={(e) => updatePreloader('loadingMessage', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent-green focus:outline-none transition-colors"
                placeholder="Enter loading message..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            type="button"
            className="px-6 py-3 rounded-xl border border-gray-700 text-text-secondary text-sm font-medium hover:text-white hover:border-gray-500 hover:bg-bg-card-alt transition-all"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            className="bg-accent-green text-black font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>

      {/* Right column: Sticky live preview */}
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>
          <LivePreviewPanel theme={theme} typography={typography} />
        </div>
      </div>
    </div>
  );
}
