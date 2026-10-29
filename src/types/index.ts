export interface PopulationPoint {
  year: number;
  population: number;
}

export interface PopulationResponse {
  country: string;
  unit: string;
  data: PopulationPoint[];
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export type PresetId = '1991-2026' | '2000-2026' | '2010-2026' | 'custom';

export interface RangePreset {
  id: Exclude<PresetId, 'custom'>;
  label: string;
  from: number;
  to: number;
}

export interface YearRange {
  from: number;
  to: number;
}

export interface RangeSelection extends YearRange {
  preset: PresetId;
}

export interface PopulationStats {
  fromYear: number;
  toYear: number;
  /** Tanlangan davrdagi so'nggi aholi soni */
  latest: number;
  /** Boshlang'ich aholi soni */
  initial: number;
  totalGrowth: number;
  growthPercent: number;
  /** O'rtacha yillik o'sish sur'ati (CAGR), % */
  cagr: number;
}

export type ChartType = 'line' | 'bar';
export type Theme = 'light' | 'dark';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiErrorKind; httpStatus?: number };

export type Language = 'uz' | 'en' | 'ru';

/** API xatolik turi — UI uni tanlangan tilga tarjima qiladi */
export type ApiErrorKind = 'network' | 'timeout' | 'server' | 'invalid';
