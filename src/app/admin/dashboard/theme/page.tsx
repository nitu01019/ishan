'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ThemeConfig } from '@/types';

interface ColorField {
  readonly key: keyof ThemeConfig;
  readonly label: string;
  readonly description: string;
}

interface PresetTheme {
  readonly name: string;
  readonly swatch: string;
  readonly colors: ThemeConfig;
}

const COLOR_FIELDS: readonly ColorField[] = [
  { key: 'accentColor', label: 'Accent Color', description: 'Buttons, CTAs, active states, highlights' },
  { key: 'accentTeal', label: 'Accent Teal', description: 'Secondary accent, gradients' },
  { key: 'accentCyan', label: 'Accent Cyan', description: 'Tertiary accent, gradients' },
  { key: 'bgPrimary', label: 'Background', description: 'Page background' },
  { key: 'bgCard', label: 'Card Background', description: 'Card surfaces' },
  { key: 'bgCardAlt', label: 'Card Alt', description: 'Input backgrounds, alt surfaces' },
  { key: 'textPrimary', label: 'Text Primary', description: 'Main text color' },
  { key: 'textSecondary', label: 'Text Secondary', description: 'Muted text' },
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

function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return '0, 0, 0';
  }

  return `${r}, ${g}, ${b}`;
}

function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function applyCssVariables(theme: ThemeConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--color-accent-green', hexToRgb(theme.accentColor));
  root.style.setProperty('--color-accent-teal', hexToRgb(theme.accentTeal));
  root.style.setProperty('--color-accent-cyan', hexToRgb(theme.accentCyan));
  root.style.setProperty('--color-bg-primary', hexToRgb(theme.bgPrimary));
  root.style.setProperty('--color-bg-card', hexToRgb(theme.bgCard));
  root.style.setProperty('--color-bg-card-alt', hexToRgb(theme.bgCardAlt));
  root.style.setProperty('--color-text-primary', hexToRgb(theme.textPrimary));
  root.style.setProperty('--color-text-secondary', hexToRgb(theme.textSecondary));
}

function getActivePresetName(theme: ThemeConfig): string | null {
  const match = PRESET_THEMES.find((preset) =>
    COLOR_FIELDS.every((field) => preset.colors[field.key].toUpperCase() === theme[field.key].toUpperCase())
  );
  return match?.name ?? null;
}

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeConfig>({ ...DEFAULT_THEME });
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

  function applyPreset(preset: PresetTheme) {
    setTheme({ ...preset.colors });
  }

  function handleReset() {
    setTheme({ ...DEFAULT_THEME });
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
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) {
        throw new Error('Failed to save theme.');
      }

      applyCssVariables(theme);
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Theme Customization</h1>
        <p className="text-text-secondary text-sm mt-1">
          Customize your portfolio colors and appearance.
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

      {/* Color Pickers and Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Color Pickers */}
        <div className="lg:col-span-2 bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Colors</h2>
          <hr className="border-gray-700 mb-4" />
          <div className="space-y-4">
            {COLOR_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                {/* Color Picker */}
                <input
                  type="color"
                  value={isValidHex(theme[field.key]) ? theme[field.key] : '#000000'}
                  onChange={(e) => updateColor(field.key, e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-lg [&::-moz-color-swatch]:border-0"
                />

                {/* Label and Description */}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-white">
                    {field.label}
                  </span>
                  <span className="block text-xs text-text-secondary truncate">
                    {field.description}
                  </span>
                </div>

                {/* Preview Swatch */}
                <div
                  className="w-8 h-8 rounded-md border border-gray-600 shrink-0"
                  style={{ backgroundColor: isValidHex(theme[field.key]) ? theme[field.key] : '#000' }}
                />

                {/* Hex Input */}
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

        {/* Live Preview */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>
          <hr className="border-gray-700 mb-4" />
          <div
            className="rounded-xl p-5 border border-gray-600 space-y-4"
            style={{ backgroundColor: isValidHex(theme.bgPrimary) ? theme.bgPrimary : '#0B1120' }}
          >
            {/* Preview Card */}
            <div
              className="rounded-lg p-4 space-y-3"
              style={{ backgroundColor: isValidHex(theme.bgCard) ? theme.bgCard : '#111827' }}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: isValidHex(theme.textPrimary) ? theme.textPrimary : '#FFFFFF' }}
              >
                Preview Card
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: isValidHex(theme.textSecondary) ? theme.textSecondary : '#9CA3AF' }}
              >
                This is how muted text will look on your card backgrounds.
              </p>

              {/* Accent Button */}
              <button
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: isValidHex(theme.accentColor) ? theme.accentColor : '#00E676' }}
                type="button"
              >
                Primary Button
              </button>
            </div>

            {/* Alt Card */}
            <div
              className="rounded-lg p-4 space-y-2"
              style={{ backgroundColor: isValidHex(theme.bgCardAlt) ? theme.bgCardAlt : '#1E293B' }}
            >
              <h4
                className="text-xs font-semibold"
                style={{ color: isValidHex(theme.textPrimary) ? theme.textPrimary : '#FFFFFF' }}
              >
                Input Area
              </h4>
              <div
                className="rounded-md px-3 py-2 text-xs"
                style={{
                  backgroundColor: isValidHex(theme.bgCard) ? theme.bgCard : '#111827',
                  color: isValidHex(theme.textSecondary) ? theme.textSecondary : '#9CA3AF',
                }}
              >
                Placeholder text...
              </div>
            </div>

            {/* Gradient Bar */}
            <div className="flex gap-1.5">
              <div
                className="h-2 flex-1 rounded-full"
                style={{ backgroundColor: isValidHex(theme.accentColor) ? theme.accentColor : '#00E676' }}
              />
              <div
                className="h-2 flex-1 rounded-full"
                style={{ backgroundColor: isValidHex(theme.accentTeal) ? theme.accentTeal : '#00BFA5' }}
              />
              <div
                className="h-2 flex-1 rounded-full"
                style={{ backgroundColor: isValidHex(theme.accentCyan) ? theme.accentCyan : '#26C6DA' }}
              />
            </div>

            {/* Text Samples */}
            <div className="space-y-1 pt-1">
              <p
                className="text-xs font-medium"
                style={{ color: isValidHex(theme.accentColor) ? theme.accentColor : '#00E676' }}
              >
                Accent link or highlight
              </p>
              <p
                className="text-xs"
                style={{ color: isValidHex(theme.textPrimary) ? theme.textPrimary : '#FFFFFF' }}
              >
                Primary text sample
              </p>
              <p
                className="text-xs"
                style={{ color: isValidHex(theme.textSecondary) ? theme.textSecondary : '#9CA3AF' }}
              >
                Secondary muted text
              </p>
            </div>
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
  );
}
