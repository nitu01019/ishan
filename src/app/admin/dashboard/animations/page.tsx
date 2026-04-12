'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, type TargetAndTransition } from 'framer-motion';
import type { AnimationConfig } from '@/types';
import { defaultAnimationConfig } from '@/lib/visual-config-defaults';
import SelectControl from '@/components/admin/SelectControl';

const CARD_ENTRANCE_OPTIONS = [
  { value: 'fade-up', label: 'Fade Up' },
  { value: 'slide-in', label: 'Slide In' },
  { value: 'scale', label: 'Scale Up' },
  { value: 'flip', label: '3D Flip' },
  { value: 'none', label: 'No Animation' },
] as const;

const BUTTON_HOVER_OPTIONS = [
  { value: 'glow', label: 'Green Glow' },
  { value: 'lift', label: 'Lift Up' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'none', label: 'No Effect' },
] as const;

const SCROLL_SPEED_OPTIONS = [
  { value: 'slow', label: 'Slow' },
  { value: 'medium', label: 'Medium' },
  { value: 'fast', label: 'Fast' },
] as const;

/* ---------------------------------------------------------------------------
 * Animation helpers for framer-motion previews
 * -------------------------------------------------------------------------*/

function getEntranceInitial(
  entrance: AnimationConfig['cardEntrance'],
): Record<string, number> {
  switch (entrance) {
    case 'fade-up':
      return { opacity: 0, y: 30 };
    case 'slide-in':
      return { opacity: 0, x: -40 };
    case 'scale':
      return { opacity: 0, scale: 0.5 };
    case 'flip':
      return { opacity: 0, rotateY: 90 };
    case 'none':
    default:
      return { opacity: 1, y: 0, x: 0, scale: 1, rotateY: 0 };
  }
}

function getEntranceAnimate(
  entrance: AnimationConfig['cardEntrance'],
): Record<string, number> {
  switch (entrance) {
    case 'fade-up':
      return { opacity: 1, y: 0 };
    case 'slide-in':
      return { opacity: 1, x: 0 };
    case 'scale':
      return { opacity: 1, scale: 1 };
    case 'flip':
      return { opacity: 1, rotateY: 0 };
    case 'none':
    default:
      return { opacity: 1, y: 0, x: 0, scale: 1, rotateY: 0 };
  }
}

function getHoverProps(
  hover: AnimationConfig['buttonHover'],
): TargetAndTransition {
  switch (hover) {
    case 'glow':
      return { scale: 1.05, boxShadow: '0 0 20px rgba(0,230,118,0.4)' };
    case 'lift':
      return { y: -4 };
    case 'pulse':
      return {
        scale: [1, 1.08, 1],
        transition: { repeat: Infinity, duration: 0.8 },
      };
    case 'none':
    default:
      return {};
  }
}

function getScrollSpeedDuration(
  speed: AnimationConfig['scrollSpeed'],
): number {
  switch (speed) {
    case 'slow':
      return 12;
    case 'medium':
      return 7;
    case 'fast':
      return 3;
    default:
      return 7;
  }
}

/* ---------------------------------------------------------------------------
 * Reusable Preview wrapper
 * -------------------------------------------------------------------------*/

function PreviewPanel({
  label,
  onReplay,
  children,
}: {
  readonly label: string;
  readonly onReplay: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">
          {label}
        </p>
        <button
          type="button"
          onClick={onReplay}
          className="text-xs text-accent-green/70 hover:text-accent-green transition-colors flex items-center gap-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Replay
        </button>
      </div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------*/

export default function AnimationsPage() {
  const [animations, setAnimations] = useState<AnimationConfig>({
    ...defaultAnimationConfig,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Keys that increment to force re-mount and replay animations
  const [entranceKey, setEntranceKey] = useState(0);
  const [scrollPreviewKey, setScrollPreviewKey] = useState(0);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/site-config');
        if (!res.ok) {
          throw new Error('Failed to fetch configuration.');
        }
        const data = await res.json();
        const saved = data.data?.animations;

        if (saved && typeof saved === 'object') {
          setAnimations({
            cardEntrance:
              saved.cardEntrance ?? defaultAnimationConfig.cardEntrance,
            buttonHover:
              saved.buttonHover ?? defaultAnimationConfig.buttonHover,
            scrollAnimations:
              saved.scrollAnimations ?? defaultAnimationConfig.scrollAnimations,
            scrollSpeed:
              saved.scrollSpeed ?? defaultAnimationConfig.scrollSpeed,
          });
        }
      } catch {
        setError('Failed to load animation configuration.');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const updateAnimation = useCallback(
    <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => {
      setAnimations((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Whenever cardEntrance changes, bump the key so the preview replays
  useEffect(() => {
    setEntranceKey((k) => k + 1);
  }, [animations.cardEntrance]);

  // Whenever scroll settings change, bump key
  useEffect(() => {
    setScrollPreviewKey((k) => k + 1);
  }, [animations.scrollAnimations, animations.scrollSpeed]);

  function handleReset() {
    setAnimations({ ...defaultAnimationConfig });
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
        body: JSON.stringify({ animations }),
      });

      if (!res.ok) {
        throw new Error('Failed to save animations.');
      }

      setSuccess('Animations saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save animations. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-text-secondary">Loading animations...</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Animations</h1>
        <p className="text-text-secondary text-sm mt-1">
          Control motion effects, entrance animations, and hover behaviors
          across your portfolio.
        </p>
      </div>

      {/* Status Messages */}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {success && (
        <p className="text-accent-green text-sm mb-4">{success}</p>
      )}

      <div className="space-y-6 mb-8">
        {/* ---------------------------------------------------------------
         * Card Entrance Animation
         * -------------------------------------------------------------*/}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-1">
            Card Entrance Animation
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            The animation played when cards first appear in the viewport.
          </p>
          <hr className="border-gray-700 mb-4" />

          <SelectControl
            label="Animation Style"
            description="Choose how cards animate into view"
            value={animations.cardEntrance}
            options={CARD_ENTRANCE_OPTIONS}
            onChange={(value) =>
              updateAnimation(
                'cardEntrance',
                value as AnimationConfig['cardEntrance'],
              )
            }
          />

          {/* Live Preview */}
          <PreviewPanel
            label="Preview"
            onReplay={() => setEntranceKey((k) => k + 1)}
          >
            <motion.div
              key={`entrance-${animations.cardEntrance}-${entranceKey}`}
              className="flex gap-3"
            >
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-20 h-28 rounded-lg bg-white/10 border border-white/20 flex flex-col items-center justify-center gap-2"
                  initial={getEntranceInitial(animations.cardEntrance)}
                  animate={getEntranceAnimate(animations.cardEntrance)}
                  transition={{
                    delay: i * 0.15,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                >
                  <div className="w-10 h-10 rounded bg-accent-green/15 border border-accent-green/30" />
                  <div className="w-12 h-1.5 rounded-full bg-white/15" />
                  <div className="w-8 h-1.5 rounded-full bg-white/10" />
                </motion.div>
              ))}
            </motion.div>
          </PreviewPanel>
        </div>

        {/* ---------------------------------------------------------------
         * Button Hover Effect
         * -------------------------------------------------------------*/}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-1">
            Button Hover Effect
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            The visual feedback when users hover over buttons and interactive
            elements.
          </p>
          <hr className="border-gray-700 mb-4" />

          <SelectControl
            label="Hover Style"
            description="Choose the hover effect for buttons"
            value={animations.buttonHover}
            options={BUTTON_HOVER_OPTIONS}
            onChange={(value) =>
              updateAnimation(
                'buttonHover',
                value as AnimationConfig['buttonHover'],
              )
            }
          />

          {/* Live Preview */}
          <PreviewPanel label="Preview" onReplay={() => { /* hover is interactive, no replay needed */ }}>
            <div className="flex flex-wrap gap-3">
              <motion.button
                type="button"
                className="px-5 py-2.5 rounded-lg bg-accent-green/20 border border-accent-green text-white text-sm font-medium"
                whileHover={getHoverProps(animations.buttonHover)}
              >
                Hover me
              </motion.button>
              <motion.button
                type="button"
                className="px-5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium"
                whileHover={getHoverProps(animations.buttonHover)}
              >
                Another button
              </motion.button>
              <motion.button
                type="button"
                className="px-5 py-2.5 rounded-lg bg-accent-teal/20 border border-accent-teal/50 text-white text-sm font-medium"
                whileHover={getHoverProps(animations.buttonHover)}
              >
                Try this one
              </motion.button>
            </div>
            <p className="text-[10px] text-white/30 mt-3">
              Hover over the buttons above to see the effect.
            </p>
          </PreviewPanel>
        </div>

        {/* ---------------------------------------------------------------
         * Scroll Animations
         * -------------------------------------------------------------*/}
        <div className="bg-bg-card rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-1">
            Scroll Animations
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            Animate elements as users scroll down the page.
          </p>
          <hr className="border-gray-700 mb-4" />

          {/* Toggle */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="block text-sm font-medium text-white">
                Enable Scroll Animations
              </span>
              <span className="block text-xs text-text-secondary">
                Trigger entrance animations as sections come into view
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={animations.scrollAnimations}
              onClick={() =>
                updateAnimation(
                  'scrollAnimations',
                  !animations.scrollAnimations,
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                animations.scrollAnimations ? 'bg-accent-green' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  animations.scrollAnimations
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Scroll Animation Preview */}
          <PreviewPanel
            label="Preview"
            onReplay={() => setScrollPreviewKey((k) => k + 1)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  animations.scrollAnimations
                    ? 'bg-accent-green'
                    : 'bg-gray-600'
                }`}
              />
              <span className="text-xs text-white/50">
                {animations.scrollAnimations
                  ? 'Scroll animations are ON -- elements will animate as they enter the viewport.'
                  : 'Scroll animations are OFF -- elements appear instantly.'}
              </span>
            </div>

            {animations.scrollAnimations && (
              <motion.div
                key={`scroll-anim-${scrollPreviewKey}`}
                className="mt-3 flex gap-2"
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-8 flex-1 rounded-md bg-accent-green/15 border border-accent-green/25"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.3,
                      duration: 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </motion.div>
            )}

            {!animations.scrollAnimations && (
              <div className="mt-3 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 rounded-md bg-white/5 border border-white/10"
                  />
                ))}
              </div>
            )}
          </PreviewPanel>

          {/* Scroll Speed (conditional) */}
          {animations.scrollAnimations && (
            <>
              <div className="mt-6">
                <SelectControl
                  label="Scroll Speed"
                  description="How quickly animations trigger relative to scroll position"
                  value={animations.scrollSpeed}
                  options={SCROLL_SPEED_OPTIONS}
                  onChange={(value) =>
                    updateAnimation(
                      'scrollSpeed',
                      value as AnimationConfig['scrollSpeed'],
                    )
                  }
                />
              </div>

              {/* Scroll Speed Preview - horizontal marquee */}
              <PreviewPanel
                label="Speed Preview"
                onReplay={() => setScrollPreviewKey((k) => k + 1)}
              >
                <div className="overflow-hidden rounded-lg bg-white/5 h-10 relative">
                  <motion.div
                    key={`speed-${animations.scrollSpeed}-${scrollPreviewKey}`}
                    className="absolute top-0 left-0 h-full flex items-center gap-4 whitespace-nowrap"
                    initial={{ x: '100%' }}
                    animate={{ x: '-100%' }}
                    transition={{
                      duration: getScrollSpeedDuration(animations.scrollSpeed),
                      ease: 'linear',
                      repeat: Infinity,
                    }}
                  >
                    {['Videos', 'Testimonials', 'Services', 'Pricing', 'Contact', 'FAQ'].map(
                      (section) => (
                        <span
                          key={section}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green/70 text-xs"
                        >
                          {section}
                        </span>
                      ),
                    )}
                  </motion.div>
                </div>
                <p className="text-[10px] text-white/30 mt-2">
                  Speed: {animations.scrollSpeed} --{' '}
                  {animations.scrollSpeed === 'slow'
                    ? 'animations trigger late for a subtle feel'
                    : animations.scrollSpeed === 'fast'
                      ? 'animations trigger early for an energetic feel'
                      : 'balanced animation timing'}
                </p>
              </PreviewPanel>
            </>
          )}
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
          {saving ? 'Saving...' : 'Save Animations'}
        </button>
      </div>
    </div>
  );
}
