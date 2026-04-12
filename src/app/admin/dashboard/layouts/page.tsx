'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LayoutConfig } from '@/types';
import { defaultLayoutConfig } from '@/lib/visual-config-defaults';

/* ------------------------------------------------------------------ */
/*  Wireframe Preview Components                                       */
/* ------------------------------------------------------------------ */

function TestimonialsPreview({ layout }: { readonly layout: string }) {
  switch (layout) {
    case 'cards':
      return (
        <div className="flex flex-col gap-1.5 p-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 rounded bg-white/15 border border-white/10" />
          ))}
          <p className="text-[10px] text-white/40 mt-1">Stacking cards</p>
        </div>
      );
    case 'grid':
      return (
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 rounded bg-white/15 border border-white/10" />
          ))}
          <p className="text-[10px] text-white/40 mt-1 col-span-3">3-column grid</p>
        </div>
      );
    case 'carousel':
      return (
        <div className="relative p-3">
          <div className="flex gap-1.5 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-14 flex-shrink-0 rounded bg-white/15 border border-white/10" />
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">Horizontal scroll</p>
        </div>
      );
    case 'masonry':
      return (
        <div className="columns-3 gap-1.5 p-3">
          {[24, 32, 20, 28, 36, 22].map((h, i) => (
            <div
              key={i}
              className="mb-1.5 rounded bg-white/15 border border-white/10"
              style={{ height: h }}
            />
          ))}
          <p className="text-[10px] text-white/40 mt-1 break-inside-avoid">Masonry layout</p>
        </div>
      );
    default:
      return null;
  }
}

function PricingPreview({ layout }: { readonly layout: string }) {
  switch (layout) {
    case 'cards':
      return (
        <div className="flex gap-1.5 p-3 items-end">
          <div className="flex-1 h-12 rounded bg-white/15 border border-white/10" />
          <div className="flex-1 h-16 rounded bg-white/20 border border-white/15" />
          <div className="flex-1 h-12 rounded bg-white/15 border border-white/10" />
          <p className="sr-only">Side-by-side cards</p>
        </div>
      );
    case 'comparison':
      return (
        <div className="p-3">
          <div className="grid grid-cols-4 gap-px">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 ${i < 4 ? 'bg-white/20' : 'bg-white/10'} border border-white/5`}
              />
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">Comparison table</p>
        </div>
      );
    case 'stacked':
      return (
        <div className="flex flex-col gap-1.5 p-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-full rounded bg-white/15 border border-white/10" />
          ))}
          <p className="text-[10px] text-white/40 mt-1">Stacked full-width</p>
        </div>
      );
    default:
      return null;
  }
}

function ServicesPreview({ layout }: { readonly layout: string }) {
  switch (layout) {
    case 'cards':
      return (
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 rounded bg-white/15 border border-white/10" />
          ))}
          <p className="text-[10px] text-white/40 mt-1 col-span-3">Card grid</p>
        </div>
      );
    case 'timeline':
      return (
        <div className="flex flex-col items-center gap-1 p-3 relative">
          <div className="absolute left-1/2 top-3 bottom-3 w-px bg-white/20" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-5 w-3/5 rounded bg-white/15 border border-white/10 ${
                i % 2 === 0 ? 'self-end mr-1' : 'self-start ml-1'
              }`}
            />
          ))}
          <p className="text-[10px] text-white/40 mt-1 relative z-10">Timeline view</p>
        </div>
      );
    case 'icons-grid':
      return (
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 p-3 justify-items-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className="h-5 w-5 rounded-full bg-white/15 border border-white/10" />
              <div className="h-1 w-6 rounded bg-white/10" />
            </div>
          ))}
          <p className="text-[10px] text-white/40 mt-1 col-span-3">Icons grid</p>
        </div>
      );
    default:
      return null;
  }
}

function VideosPreview({ layout }: { readonly layout: string }) {
  switch (layout) {
    case 'grid':
      return (
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-7 rounded bg-white/15 border border-white/10 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[4px] border-l-white/30 border-y-[3px] border-y-transparent" />
            </div>
          ))}
          <p className="text-[10px] text-white/40 mt-1 col-span-3">Video grid</p>
        </div>
      );
    case 'carousel':
      return (
        <div className="relative p-3">
          <div className="flex gap-1.5 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 w-16 flex-shrink-0 rounded bg-white/15 border border-white/10 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[4px] border-l-white/30 border-y-[3px] border-y-transparent" />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">Horizontal carousel</p>
        </div>
      );
    case 'featured':
      return (
        <div className="p-3 space-y-1.5">
          <div className="h-12 rounded bg-white/20 border border-white/15 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[6px] border-l-white/30 border-y-[4px] border-y-transparent" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 rounded bg-white/10 border border-white/5" />
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-1">Featured + list</p>
        </div>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Layout Option Card Selector                                        */
/* ------------------------------------------------------------------ */

interface LayoutOption {
  readonly value: string;
  readonly label: string;
}

interface LayoutSelectorProps<V extends string> {
  readonly options: readonly LayoutOption[];
  readonly current: V;
  readonly onSelect: (value: V) => void;
  readonly PreviewComponent: React.ComponentType<{ readonly layout: string }>;
}

function LayoutSelector<V extends string>({
  options,
  current,
  onSelect,
  PreviewComponent,
}: LayoutSelectorProps<V>) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      {options.map((option) => {
        const isSelected = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value as V)}
            className={`p-2 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? 'border-accent-green bg-accent-green/10 ring-1 ring-accent-green shadow-green'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
            }`}
          >
            <div className="h-24 relative overflow-hidden rounded-lg bg-white/[0.03]">
              <PreviewComponent layout={option.value} />
            </div>
            <p
              className={`text-xs mt-2 text-center font-medium ${
                isSelected ? 'text-accent-green' : 'text-white/60'
              }`}
            >
              {option.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout Options                                                     */
/* ------------------------------------------------------------------ */

const TESTIMONIALS_OPTIONS: readonly LayoutOption[] = [
  { value: 'cards', label: 'Card Grid' },
  { value: 'carousel', label: 'Horizontal Carousel' },
  { value: 'grid', label: 'Compact Grid' },
  { value: 'masonry', label: 'Masonry Layout' },
];

const PRICING_OPTIONS: readonly LayoutOption[] = [
  { value: 'cards', label: 'Side-by-Side Cards' },
  { value: 'comparison', label: 'Comparison Table' },
  { value: 'stacked', label: 'Stacked Full-Width' },
];

const SERVICES_OPTIONS: readonly LayoutOption[] = [
  { value: 'cards', label: 'Card Grid' },
  { value: 'timeline', label: 'Timeline View' },
  { value: 'icons-grid', label: 'Icons Grid' },
];

const VIDEOS_OPTIONS: readonly LayoutOption[] = [
  { value: 'carousel', label: 'Carousel' },
  { value: 'grid', label: 'Grid View' },
  { value: 'featured', label: 'Featured + List' },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function LayoutsPage() {
  const [layouts, setLayouts] = useState<LayoutConfig>({ ...defaultLayoutConfig });
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
        const saved = data.data?.layouts;

        if (saved && typeof saved === 'object') {
          setLayouts({
            testimonials: saved.testimonials ?? defaultLayoutConfig.testimonials,
            pricing: saved.pricing ?? defaultLayoutConfig.pricing,
            services: saved.services ?? defaultLayoutConfig.services,
            videos: saved.videos ?? defaultLayoutConfig.videos,
          });
        }
      } catch {
        setError('Failed to load layout configuration.');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const updateLayout = useCallback(<K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => {
    setLayouts((prev) => ({ ...prev, [key]: value }));
  }, []);

  function handleReset() {
    setLayouts({ ...defaultLayoutConfig });
    setError('');
    setSuccess('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layouts }),
      });

      if (!res.ok) {
        throw new Error('Failed to save layouts.');
      }

      setSuccess('Layouts saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save layouts. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-text-secondary">Loading layouts...</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Section Layouts</h1>
        <p className="text-text-secondary text-sm mt-1">
          Choose a layout variant for each section of your portfolio. Click a preview to select it.
        </p>
      </div>

      {/* Status Messages */}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {success && <p className="text-accent-green text-sm mb-4">{success}</p>}

      {/* Layout Selectors */}
      <div className="space-y-6 mb-8">
        {/* Testimonials */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-1">Testimonials Layout</h2>
          <p className="text-xs text-text-secondary mb-1">
            Controls how client testimonials are displayed on the portfolio page.
          </p>
          <hr className="border-gray-700 mb-2" />
          <LayoutSelector
            options={TESTIMONIALS_OPTIONS}
            current={layouts.testimonials}
            onSelect={(value) => updateLayout('testimonials', value as LayoutConfig['testimonials'])}
            PreviewComponent={TestimonialsPreview}
          />
        </div>

        {/* Pricing */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-1">Pricing Layout</h2>
          <p className="text-xs text-text-secondary mb-1">
            Controls how pricing plans are presented to potential clients.
          </p>
          <hr className="border-gray-700 mb-2" />
          <LayoutSelector
            options={PRICING_OPTIONS}
            current={layouts.pricing}
            onSelect={(value) => updateLayout('pricing', value as LayoutConfig['pricing'])}
            PreviewComponent={PricingPreview}
          />
        </div>

        {/* Services */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-1">Services Layout</h2>
          <p className="text-xs text-text-secondary mb-1">
            Controls how your offered services are organized on the page.
          </p>
          <hr className="border-gray-700 mb-2" />
          <LayoutSelector
            options={SERVICES_OPTIONS}
            current={layouts.services}
            onSelect={(value) => updateLayout('services', value as LayoutConfig['services'])}
            PreviewComponent={ServicesPreview}
          />
        </div>

        {/* Videos */}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-1">Videos Layout</h2>
          <p className="text-xs text-text-secondary mb-1">
            Controls how your video portfolio is showcased to visitors.
          </p>
          <hr className="border-gray-700 mb-2" />
          <LayoutSelector
            options={VIDEOS_OPTIONS}
            current={layouts.videos}
            onSelect={(value) => updateLayout('videos', value as LayoutConfig['videos'])}
            PreviewComponent={VideosPreview}
          />
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
          {saving ? 'Saving...' : 'Save Layouts'}
        </button>
      </div>
    </div>
  );
}
