'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import SelectControl from '@/components/admin/SelectControl';
import SliderControl from '@/components/admin/SliderControl';
import ToggleSwitch from '@/components/admin/ToggleSwitch';
import { defaultNavConfig } from '@/lib/visual-config-defaults';

type NavStyle = 'glass' | 'solid' | 'minimal';

interface NavFormState {
  readonly logoText: string;
  readonly ctaText: string;
  readonly style: NavStyle;
  readonly sticky: boolean;
  readonly opacity: number;
  readonly bgColor: string;
}

const NAV_STYLE_OPTIONS = [
  { value: 'glass', label: 'Glass/Blur' },
  { value: 'solid', label: 'Solid Color' },
  { value: 'minimal', label: 'Minimal/Transparent' },
] as const;

const NAV_STYLES: readonly NavStyle[] = ['glass', 'solid', 'minimal'] as const;

const DEFAULT_BG_COLOR = '#0B1120';

function getNavPreviewStyle(
  style: NavStyle,
  opacity: number,
  bgColor: string,
): React.CSSProperties {
  const opacityFraction = opacity / 100;
  switch (style) {
    case 'glass':
      return {
        backgroundColor: `rgba(255, 255, 255, ${0.03 * opacityFraction})`,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      };
    case 'solid':
      return {
        backgroundColor: bgColor,
        opacity: opacityFraction,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      };
    case 'minimal':
      return {
        backgroundColor: 'transparent',
      };
    default:
      return {};
  }
}

function getMiniNavStyle(
  s: NavStyle,
  opacity: number,
  bgColor: string,
): React.CSSProperties {
  const opacityFraction = opacity / 100;
  switch (s) {
    case 'glass':
      return {
        backgroundColor: `rgba(255, 255, 255, ${0.06 * opacityFraction})`,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
      };
    case 'solid':
      return {
        backgroundColor: bgColor,
        opacity: opacityFraction,
        border: '1px solid rgba(255,255,255,0.1)',
      };
    case 'minimal':
      return {
        backgroundColor: 'transparent',
        border: '1px dashed rgba(255,255,255,0.15)',
      };
    default:
      return {};
  }
}

export default function NavStylePage() {
  const [form, setForm] = useState<NavFormState>({
    logoText: defaultNavConfig.logoText,
    ctaText: defaultNavConfig.ctaText,
    style: defaultNavConfig.style,
    sticky: defaultNavConfig.sticky,
    opacity: 80,
    bgColor: DEFAULT_BG_COLOR,
  });
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
        const config = data.data ?? {};
        const navbar = config.navbar ?? {};
        const theme = config.theme ?? {};

        setForm({
          logoText: navbar.logoText ?? defaultNavConfig.logoText,
          ctaText: navbar.ctaText ?? defaultNavConfig.ctaText,
          style: navbar.style ?? defaultNavConfig.style,
          sticky: navbar.sticky ?? defaultNavConfig.sticky,
          opacity: navbar.opacity ?? 80,
          bgColor: navbar.bgColor ?? theme.bgPrimary ?? DEFAULT_BG_COLOR,
        });
      } catch {
        setError('Failed to load nav configuration.');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  function updateField<K extends keyof NavFormState>(field: K, value: NavFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      navbar: {
        logoText: form.logoText,
        ctaText: form.ctaText,
        style: form.style,
        sticky: form.sticky,
        opacity: form.opacity,
        bgColor: form.bgColor,
        transparent: form.style !== 'solid',
      },
    };

    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save configuration.');
      }

      setSuccess('Nav style saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save nav style. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function isValidHex(value: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  }

  if (loading) {
    return <p className="text-text-secondary">Loading nav settings...</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nav Style</h1>
        <p className="text-text-secondary text-sm mt-1">
          Customize the navigation bar appearance and behavior.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {success && <p className="text-accent-green text-sm mb-4">{success}</p>}

      {/* Live Navbar Preview */}
      <div className="mb-8 rounded-xl overflow-hidden border border-white/10">
        <p className="text-xs text-white/40 px-4 py-2 bg-white/5 uppercase tracking-wider">
          Live Preview
        </p>
        <div className="relative h-20 bg-[#0B1120]">
          {/* Simulated page content behind navbar */}
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className="text-[10px] text-white/20">Page content</span>
          </div>
          {/* Mini navbar preview */}
          <div
            className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 transition-all duration-300"
            style={getNavPreviewStyle(form.style, form.opacity, form.bgColor)}
          >
            <span className="text-white font-bold text-sm">
              {form.logoText || 'Logo'}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs hidden sm:inline">Work</span>
              <span className="text-white/60 text-xs hidden sm:inline">Services</span>
              <span className="text-white/60 text-xs hidden sm:inline">Pricing</span>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-accent-green/20 border border-accent-green text-white text-xs cursor-default"
              >
                {form.ctaText || 'Hire me'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Text Settings */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Text</h2>
          <hr className="border-gray-700 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Logo Text
              </label>
              <input
                type="text"
                value={form.logoText}
                onChange={(e) => updateField('logoText', e.target.value)}
                placeholder="e.g. Ishan"
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => updateField('ctaText', e.target.value)}
                placeholder="e.g. Hire me"
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Style & Behavior */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Style &amp; Behavior
          </h2>
          <hr className="border-gray-700 mb-4" />
          <div className="space-y-6">
            <SelectControl
              label="Nav Style"
              description="Choose the navigation bar visual style"
              value={form.style}
              options={[...NAV_STYLE_OPTIONS]}
              onChange={(v) => updateField('style', v as NavFormState['style'])}
            />

            {/* Style Preview Cards */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              {NAV_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateField('style', s)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    form.style === s
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div
                    className="h-8 rounded-md mb-2"
                    style={getMiniNavStyle(s, form.opacity, form.bgColor)}
                  />
                  <span className="text-xs text-white/70 capitalize">{s}</span>
                </button>
              ))}
            </div>

            <ToggleSwitch
              label="Sticky Navigation"
              description="Keep the nav bar fixed at the top while scrolling"
              checked={form.sticky}
              onChange={(v) => updateField('sticky', v)}
            />

            {/* Sticky vs Non-Sticky Visual Indicator */}
            <div className="grid grid-cols-2 gap-3">
              {/* Sticky ON diagram */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  form.sticky
                    ? 'border-accent-green bg-accent-green/10'
                    : 'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                <div className="h-24 rounded-md bg-white/5 relative overflow-hidden">
                  {/* Fixed navbar bar */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-accent-green/30 rounded-t-md" />
                  {/* Scrolling content lines */}
                  <div className="absolute top-6 left-2 right-2 space-y-1">
                    <div className="h-1 bg-white/10 rounded w-3/4" />
                    <div className="h-1 bg-white/10 rounded w-1/2" />
                    <div className="h-1 bg-white/10 rounded w-2/3" />
                  </div>
                  {/* Down arrow indicating scroll */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/30 text-[10px]">
                    ↓ scroll ↓
                  </div>
                </div>
                <p className="text-[10px] text-white/50 mt-2 text-center">
                  Sticky: navbar stays at top
                </p>
              </div>

              {/* Sticky OFF diagram */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  !form.sticky
                    ? 'border-accent-green bg-accent-green/10'
                    : 'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                <div className="h-24 rounded-md bg-white/5 relative overflow-hidden">
                  {/* Navbar scrolled away (shown faded at top, partially out of view) */}
                  <div className="absolute -top-2 left-0 right-0 h-4 bg-white/10 rounded-t-md opacity-30" />
                  {/* Content fills the space */}
                  <div className="absolute top-4 left-2 right-2 space-y-1">
                    <div className="h-1 bg-white/10 rounded w-2/3" />
                    <div className="h-1 bg-white/10 rounded w-3/4" />
                    <div className="h-1 bg-white/10 rounded w-1/2" />
                    <div className="h-1 bg-white/10 rounded w-2/3" />
                  </div>
                  {/* Up arrow indicating navbar scrolled away */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/30 text-[10px]">
                    ↑ nav gone ↑
                  </div>
                </div>
                <p className="text-[10px] text-white/50 mt-2 text-center">
                  Static: navbar scrolls away
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Background</h2>
          <hr className="border-gray-700 mb-4" />
          <div className="space-y-6">
            <SliderControl
              label="Background Opacity"
              description="Controls the transparency of the navigation background"
              value={form.opacity}
              min={10}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => updateField('opacity', v)}
            />

            <div className="space-y-2">
              <div>
                <span className="block text-sm font-medium text-white">
                  Background Color
                </span>
                <span className="block text-xs text-text-secondary">
                  Hex color for the navigation background
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => updateField('bgColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={form.bgColor}
                  onChange={(e) => updateField('bgColor', e.target.value)}
                  placeholder="#0B1120"
                  className={`flex-1 bg-bg-card-alt border rounded-xl p-3 text-white font-mono text-sm focus:outline-none transition-colors ${
                    isValidHex(form.bgColor)
                      ? 'border-gray-700 focus:border-accent-green'
                      : 'border-red-500'
                  }`}
                />
                <div
                  className="w-10 h-10 rounded-lg border border-gray-700"
                  style={{ backgroundColor: form.bgColor }}
                />
              </div>
              {!isValidHex(form.bgColor) && form.bgColor.length > 0 && (
                <p className="text-red-400 text-xs">
                  Enter a valid hex color (e.g. #0B1120)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isValidHex(form.bgColor)}
            className="bg-accent-green text-black font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Nav Style'}
          </button>
        </div>
      </div>
    </div>
  );
}
