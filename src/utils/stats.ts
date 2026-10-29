import type { PopulationPoint, PopulationStats, RangePreset, YearRange } from '../types';

export const RANGE_PRESETS: RangePreset[] = [
  { id: '1991-2026', label: '1991–2026', from: 1991, to: 2026 },
  { id: '2000-2026', label: '2000–2026', from: 2000, to: 2026 },
  { id: '2010-2026', label: '2010–2026', from: 2010, to: 2026 },
];

export const filterByRange = (points: PopulationPoint[], { from, to }: YearRange): PopulationPoint[] =>
  points.filter((p) => p.year >= from && p.year <= to);

export function computeStats(points: PopulationPoint[]): PopulationStats | null {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const totalGrowth = last.population - first.population;
  const years = last.year - first.year;

  return {
    fromYear: first.year,
    toYear: last.year,
    latest: last.population,
    initial: first.population,
    totalGrowth,
    growthPercent: first.population ? (totalGrowth / first.population) * 100 : 0,
    cagr: years > 0 ? (Math.pow(last.population / first.population, 1 / years) - 1) * 100 : 0,
  };
}

export interface PopulationRow extends PopulationPoint {
  change: number | null;
  changePercent: number | null;
}

/** Har bir yil uchun oldingi yilga nisbatan o'zgarish (YoY). */
export const withYearOverYear = (points: PopulationPoint[]): PopulationRow[] =>
  points.map((p, i) => {
    const prev = points[i - 1];
    if (!prev) return { ...p, change: null, changePercent: null };
    const change = p.population - prev.population;
    return { ...p, change, changePercent: (change / prev.population) * 100 };
  });
