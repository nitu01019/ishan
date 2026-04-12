'use client';

interface SelectControlProps {
  readonly label: string;
  readonly description?: string;
  readonly value: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
  readonly onChange: (value: string) => void;
}

export default function SelectControl({
  label,
  description,
  value,
  options,
  onChange,
}: SelectControlProps) {
  return (
    <div className="space-y-2">
      <div>
        <span className="block text-sm font-medium text-white">{label}</span>
        {description && (
          <span className="block text-xs text-text-secondary">{description}</span>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-card-alt border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm
          focus:border-accent-green focus:outline-none transition-colors cursor-pointer
          appearance-none
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:12px]
          bg-[position:right_12px_center]
          bg-no-repeat
          pr-9"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
