'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import BackgroundEditor from '@/components/admin/BackgroundEditor';
import { getSectionStyle } from '@/lib/section-style';
import { useDirtyState } from '@/lib/hooks/useDirtyState';

interface BackgroundValue {
  readonly type: 'solid' | 'gradient' | 'image';
  readonly color: string;
  readonly gradientFrom: string;
  readonly gradientTo: string;
  readonly gradientDirection: string;
  readonly imageUrl: string;
  readonly opacity: number;
}

interface SectionConfig {
  readonly key: string;
  readonly label: string;
}

const SECTIONS: readonly SectionConfig[] = [
  { key: 'hero', label: 'Hero Background' },
  { key: 'videos', label: 'Videos Section' },
  { key: 'testimonials', label: 'Testimonials Section' },
  { key: 'pricing', label: 'Pricing Section' },
  { key: 'services', label: 'Services Section' },
  { key: 'contact', label: 'Contact Section' },
  { key: 'faq', label: 'FAQ Section' },
  { key: 'workflow', label: 'Workflow Section' },
  { key: 'skills', label: 'Skills Section' },
] as const;

/** Default must match visual-config-defaults.ts so the admin and public pages agree. */
const DEFAULT_BACKGROUND: BackgroundValue = {
  type: 'solid',
  color: '#0B1120',
  gradientFrom: '#0B1120',
  gradientTo: '#111827',
  gradientDirection: 'to-br',
  imageUrl: '',
  opacity: 100,
} as const;

function buildDefaultBackgrounds(): Record<string, BackgroundValue> {
  const defaults: Record<string, BackgroundValue> = {};
  for (const section of SECTIONS) {
    defaults[section.key] = { ...DEFAULT_BACKGROUND };
  }
  return defaults;
}

export default function SectionStylesPage() {
  const { value: backgrounds, setValue: setBackgrounds, markClean } = useDirtyState<Record<string, BackgroundValue>>(
    buildDefaultBackgrounds(),
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
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
        const saved = data.data?.sectionBackgrounds;

        if (saved && typeof saved === 'object') {
          const defaults = buildDefaultBackgrounds();
          const merged: Record<string, BackgroundValue> = {};

          for (const section of SECTIONS) {
            const savedSection = saved[section.key];
            if (savedSection && typeof savedSection === 'object') {
              merged[section.key] = {
                type: savedSection.type ?? defaults[section.key].type,
                color: savedSection.color ?? defaults[section.key].color,
                gradientFrom: savedSection.gradientFrom ?? defaults[section.key].gradientFrom,
                gradientTo: savedSection.gradientTo ?? defaults[section.key].gradientTo,
                gradientDirection: savedSection.gradientDirection ?? defaults[section.key].gradientDirection,
                imageUrl: savedSection.imageUrl ?? defaults[section.key].imageUrl,
                opacity: savedSection.opacity ?? defaults[section.key].opacity,
              };
            } else {
              merged[section.key] = defaults[section.key];
            }
          }

          setBackgrounds(merged);
        }
      } catch {
        setError('Failed to load section styles.');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateBackground = useCallback((key: string, value: BackgroundValue) => {
    setBackgrounds((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionBackgrounds: backgrounds }),
      });

      if (!res.ok) {
        throw new Error('Failed to save section styles.');
      }

      markClean();
      setSuccess('Section styles saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save section styles. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-text-secondary">Loading section styles...</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Section Styles</h1>
        <p className="text-text-secondary text-sm mt-1">
          Customize the background appearance for each section of your portfolio.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}
      {success && (
        <p className="text-accent-green text-sm mb-4">{success}</p>
      )}

      {/* Accordion Panels */}
      <div className="space-y-3 mb-8">
        {SECTIONS.map((section) => {
          const isOpen = openSections[section.key] ?? false;
          const bg = backgrounds[section.key];

          return (
            <div
              key={section.key}
              className="bg-bg-card rounded-2xl border border-gray-700 overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(section.key)}
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-bg-card-alt transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Tiny swatch preview */}
                  <div
                    className="w-4 h-4 rounded border border-gray-600 shrink-0"
                    style={{
                      backgroundColor:
                        bg.type === 'solid'
                          ? bg.color
                          : bg.type === 'gradient'
                            ? bg.gradientFrom
                            : '#1E293B',
                      opacity: bg.opacity / 100,
                    }}
                  />
                  <span className="text-sm font-semibold text-white">
                    {section.label}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {bg.type === 'solid' && bg.color}
                    {bg.type === 'gradient' && `${bg.gradientFrom} → ${bg.gradientTo}`}
                    {bg.type === 'image' && (bg.imageUrl ? 'Custom image' : 'No image set')}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-text-secondary transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-700">
                  <BackgroundEditor
                    value={bg}
                    onChange={(updated) => updateBackground(section.key, updated)}
                  />

                  {/* Live preview -- uses the same getSectionStyle as the public page */}
                  <div
                    className="mt-4 rounded-lg overflow-hidden border border-white/10"
                    style={{
                      height: '120px',
                      backgroundColor: '#0B1120',
                    }}
                  >
                    <div
                      className="h-full w-full"
                      style={getSectionStyle(bg)}
                    >
                      <div className="h-full flex items-center justify-center text-white/60 text-sm">
                        {section.label} Preview
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          type="button"
          className="bg-accent-green text-black font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
