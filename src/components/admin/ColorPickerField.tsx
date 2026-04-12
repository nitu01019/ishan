'use client';

import { useCallback } from 'react';

interface ColorPickerFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (hex: string) => void;
}

function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export default function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const handleSwatchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const normalized = raw.startsWith('#') ? raw : `#${raw}`;
      if (normalized.length <= 7) {
        onChange(normalized);
      }
    },
    [onChange],
  );

  const displayColor = isValidHex(value) ? value : '#000000';

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-text-secondary w-24 shrink-0">
        {label}
      </label>

      <div className="relative">
        <div
          className="w-9 h-9 rounded-lg border border-gray-600 cursor-pointer shrink-0"
          style={{ backgroundColor: displayColor }}
        />
        <input
          type="color"
          value={displayColor}
          onChange={handleSwatchChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`${label} color picker`}
        />
      </div>

      <input
        type="text"
        value={value}
        onChange={handleTextChange}
        maxLength={7}
        placeholder="#000000"
        className={`w-28 bg-bg-card-alt border rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none transition-colors ${
          isValidHex(value)
            ? 'border-gray-700 focus:border-accent-green'
            : 'border-red-500 focus:border-red-400'
        }`}
      />
    </div>
  );
}
