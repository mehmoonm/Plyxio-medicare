'use client';

import { useState } from 'react';
import type { DateRangePreset } from '@/lib/date-ranges';

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

export function DateRangePicker({
  preset,
  customStart,
  customEnd,
  onChange,
}: {
  preset: DateRangePreset;
  customStart: string;
  customEnd: string;
  onChange: (preset: DateRangePreset, customStart: string, customEnd: string) => void;
}) {
  const [start, setStart] = useState(customStart);
  const [end, setEnd] = useState(customEnd);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value, start, end)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            preset === p.value ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          {p.label}
        </button>
      ))}
      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={start}
            onChange={(e) => { setStart(e.target.value); onChange('custom', e.target.value, end); }}
            className="glass-input px-3 py-2 rounded-lg text-white text-sm"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={end}
            onChange={(e) => { setEnd(e.target.value); onChange('custom', start, e.target.value); }}
            className="glass-input px-3 py-2 rounded-lg text-white text-sm"
          />
        </div>
      )}
    </div>
  );
}
