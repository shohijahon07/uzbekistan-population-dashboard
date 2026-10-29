import { CalendarRange } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import type { PresetId, RangeSelection } from '../types';
import { RANGE_PRESETS } from '../utils/stats';

interface FilterBarProps {
  value: RangeSelection;
  years: number[];
  onChange: (value: RangeSelection) => void;
}

const segmentClass = (active: boolean) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
    active
      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
  }`;

const selectClass =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

export function FilterBar({ value, years, onChange }: FilterBarProps) {
  const { t } = useI18n();

  const selectPreset = (id: PresetId) => {
    const preset = RANGE_PRESETS.find((p) => p.id === id);
    onChange(preset ? { preset: id, from: preset.from, to: preset.to } : { ...value, preset: 'custom' });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label={t.filter.groupLabel} className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={value.preset === p.id}
            className={segmentClass(value.preset === p.id)}
            onClick={() => selectPreset(p.id)}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={value.preset === 'custom'}
          className={`${segmentClass(value.preset === 'custom')} inline-flex items-center gap-1.5`}
          onClick={() => selectPreset('custom')}
        >
          <CalendarRange className="h-4 w-4" aria-hidden />
          {t.filter.custom}
        </button>
      </div>

      {value.preset === 'custom' && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-1.5">
            <span>{t.filter.from}</span>
            <select
              className={selectClass}
              value={value.from}
              onChange={(e) => onChange({ ...value, from: Number(e.target.value) })}
            >
              {years.map((y) => (
                <option key={y} value={y} disabled={y > value.to}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <span>{t.filter.to}</span>
            <select
              className={selectClass}
              value={value.to}
              onChange={(e) => onChange({ ...value, to: Number(e.target.value) })}
            >
              {years.map((y) => (
                <option key={y} value={y} disabled={y < value.from}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
