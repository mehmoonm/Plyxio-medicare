export type DateRangePreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  start: string; // ISO date (yyyy-mm-dd)
  end: string;   // ISO date (yyyy-mm-dd)
  label: string;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getPresetRange(preset: DateRangePreset, customStart?: string, customEnd?: string): DateRange {
  const now = new Date();
  const today = toIsoDate(now);

  switch (preset) {
    case 'today':
      return { start: today, end: today, label: 'Today' };
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return { start: toIsoDate(start), end: today, label: 'This Week' };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toIsoDate(start), end: today, label: now.toLocaleString('default', { month: 'long', year: 'numeric' }) };
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: toIsoDate(start), end: today, label: String(now.getFullYear()) };
    }
    case 'custom':
      return { start: customStart || today, end: customEnd || today, label: 'Custom Range' };
  }
}
