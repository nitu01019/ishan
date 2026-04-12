'use client';

import { useCallback } from 'react';
import ColorPickerField from './ColorPickerField';

interface BackgroundValue {
  readonly type: 'solid' | 'gradient' | 'image';
  readonly color: string;
  readonly gradientFrom: string;
  readonly gradientTo: string;
  readonly gradientDirection: string;
  readonly imageUrl: string;
  readonly opacity: number;
}

interface BackgroundEditorProps {
  readonly value: BackgroundValue;
  readonly onChange: (value: BackgroundValue) => void;
}

interface GradientDirectionOption {
  readonly label: string;
  readonly value: string;
  readonly css: string;
}

const GRADIENT_DIRECTIONS: readonly GradientDirectionOption[] = [
  { label: 'Top to Bottom', value: 'to-b', css: 'to bottom' },
  { label: 'Left to Right', value: 'to-r', css: 'to right' },
  { label: 'Top-Left to Bottom-Right', value: 'to-br', css: 'to bottom right' },
  { label: 'Bottom to Top', value: 'to-t', css: 'to top' },
] as const;

const TYPE_OPTIONS: readonly { label: string; value: BackgroundValue['type'] }[] = [
  { label: 'Solid Color', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
  { label: 'Image', value: 'image' },
] as const;

function getDirectionCss(dirValue: string): string {
  const found = GRADIENT_DIRECTIONS.find((d) => d.value === dirValue);
  return found?.css ?? 'to bottom';
}

function buildPreviewStyle(value: BackgroundValue): React.CSSProperties {
  const base: React.CSSProperties = { opacity: value.opacity / 100 };

  switch (value.type) {
    case 'solid':
      return { ...base, backgroundColor: value.color || 'transparent' };
    case 'gradient':
      return {
        ...base,
        background: `linear-gradient(${getDirectionCss(value.gradientDirection)}, ${value.gradientFrom || '#000000'}, ${value.gradientTo || '#ffffff'})`,
      };
    case 'image':
      return {
        ...base,
        backgroundImage: value.imageUrl ? `url(${value.imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: value.imageUrl ? undefined : '#1E293B',
      };
    default:
      return base;
  }
}

export default function BackgroundEditor({ value, onChange }: BackgroundEditorProps) {
  const update = useCallback(
    (partial: Partial<BackgroundValue>) => {
      onChange({ ...value, ...partial });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-5">
      {/* Type Selector */}
      <div className="flex flex-wrap gap-3">
        {TYPE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
              value.type === opt.value
                ? 'border-accent-green text-accent-green bg-accent-green/10'
                : 'border-gray-700 text-text-secondary hover:text-white hover:border-gray-500'
            }`}
          >
            <input
              type="radio"
              name="bg-type"
              value={opt.value}
              checked={value.type === opt.value}
              onChange={() => update({ type: opt.value })}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Solid Color Mode */}
      {value.type === 'solid' && (
        <div>
          <ColorPickerField
            label="Color"
            value={value.color}
            onChange={(color) => update({ color })}
          />
        </div>
      )}

      {/* Gradient Mode */}
      {value.type === 'gradient' && (
        <div className="space-y-4">
          <ColorPickerField
            label="From"
            value={value.gradientFrom}
            onChange={(gradientFrom) => update({ gradientFrom })}
          />
          <ColorPickerField
            label="To"
            value={value.gradientTo}
            onChange={(gradientTo) => update({ gradientTo })}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-text-secondary w-24 shrink-0">
              Direction
            </label>
            <select
              value={value.gradientDirection}
              onChange={(e) => update({ gradientDirection: e.target.value })}
              className="bg-bg-card-alt border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-green transition-colors"
            >
              {GRADIENT_DIRECTIONS.map((dir) => (
                <option key={dir.value} value={dir.value}>
                  {dir.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Image Mode */}
      {value.type === 'image' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-text-secondary w-24 shrink-0">
              Image URL
            </label>
            <input
              type="text"
              value={value.imageUrl}
              onChange={(e) => update({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="flex-1 bg-bg-card-alt border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-green transition-colors placeholder:text-gray-500"
            />
          </div>
          {value.imageUrl && (
            <div className="ml-27">
              <img
                src={value.imageUrl}
                alt="Background preview"
                className="w-32 h-20 object-cover rounded-lg border border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Opacity Slider */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-text-secondary w-24 shrink-0">
          Opacity
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={value.opacity}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          className="flex-1 accent-accent-green h-2 rounded-full"
        />
        <span className="text-sm text-text-secondary w-12 text-right font-mono">
          {value.opacity}%
        </span>
      </div>

      {/* Live Preview Strip */}
      <div>
        <p className="text-xs text-text-secondary mb-2">Preview</p>
        <div
          className="w-full h-[60px] rounded-xl border border-gray-700 overflow-hidden"
          style={{ backgroundColor: '#0B1120' }}
        >
          <div
            className="w-full h-full"
            style={buildPreviewStyle(value)}
          />
        </div>
      </div>
    </div>
  );
}
