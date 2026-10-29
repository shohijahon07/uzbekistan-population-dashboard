import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { useI18n } from '../i18n/I18nProvider';
import type { ChartType, PopulationPoint } from '../types';
import { formatCompact, formatNumber, formatPercent, formatSigned } from '../utils/format';

export interface ChartPalette {
  series: string;
  grid: string;
  axis: string;
  cursor: string;
}

export const CHART_PALETTES: Record<'light' | 'dark', ChartPalette> = {
  light: { series: '#4f46e5', grid: '#e2e8f0', axis: '#64748b', cursor: 'rgba(79,70,229,0.08)' },
  dark: { series: '#818cf8', grid: '#1e293b', axis: '#94a3b8', cursor: 'rgba(129,140,248,0.12)' },
};

/** Line chart uchun Y o'qini ma'lumotga yaqin, "yumaloq" millionlarda chegaralaymiz. */
const lineDomain: [(min: number) => number, (max: number) => number] = [
  (min) => Math.floor((min * 0.97) / 1_000_000) * 1_000_000,
  (max) => Math.ceil((max * 1.01) / 1_000_000) * 1_000_000,
];

interface PopulationChartBodyProps {
  data: PopulationPoint[];
  type: ChartType;
  palette: ChartPalette;
  /** PDF uchun animatsiyasiz, qat'iy o'lchamli render */
  width?: number;
  height?: number;
  animate?: boolean;
  showTooltip?: boolean;
  fontSize?: number;
}

function ChartTooltip({ active, payload, data }: TooltipProps<number, string> & { data: PopulationPoint[] }) {
  const { t, locale } = useI18n();
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PopulationPoint;
  const prev = data.find((p) => p.year === point.year - 1);
  const change = prev ? point.population - prev.population : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <p className="font-semibold text-slate-900 dark:text-white">{point.year}</p>
      <p className="tabular-nums text-slate-700 dark:text-slate-200">
        {formatNumber(point.population, locale)} {t.chart.people}
      </p>
      {change !== null && prev && (
        <p className="mt-0.5 text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatSigned(change, locale)} ({formatPercent((change / prev.population) * 100, locale)}) {t.chart.yearOverYear}
        </p>
      )}
    </div>
  );
}

export function PopulationChartBody({
  data,
  type,
  palette,
  width,
  height,
  animate = true,
  showTooltip = true,
  fontSize = 12,
}: PopulationChartBodyProps) {
  const { locale } = useI18n();
  const margin = { top: 12, right: 16, left: 4, bottom: 4 };
  const common = (
    <>
      <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="year"
        tick={{ fill: palette.axis, fontSize }}
        tickLine={false}
        axisLine={{ stroke: palette.grid }}
        interval="preserveStartEnd"
        minTickGap={16}
      />
      <YAxis
        tickFormatter={(v: number) => formatCompact(v, locale)}
        tick={{ fill: palette.axis, fontSize }}
        tickLine={false}
        axisLine={false}
        width={fontSize * 5}
        domain={type === 'line' ? lineDomain : [0, 'auto']}
      />
      {showTooltip && (
        <Tooltip
          content={<ChartTooltip data={data} />}
          cursor={type === 'line' ? { stroke: palette.axis, strokeDasharray: '4 4' } : { fill: palette.cursor }}
        />
      )}
    </>
  );

  return type === 'line' ? (
    <LineChart data={data} margin={margin} width={width} height={height}>
      {common}
      <Line
        type="monotone"
        dataKey="population"
        name="Population"
        stroke={palette.series}
        strokeWidth={2.5}
        dot={{ r: 3, strokeWidth: 0, fill: palette.series }}
        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
        isAnimationActive={animate}
      />
    </LineChart>
  ) : (
    <BarChart data={data} margin={margin} width={width} height={height}>
      {common}
      <Bar dataKey="population" name="Population" fill={palette.series} radius={[4, 4, 0, 0]} isAnimationActive={animate} />
    </BarChart>
  );
}

interface PopulationChartProps {
  data: PopulationPoint[];
  type: ChartType;
  isDark: boolean;
}

export function PopulationChart({ data, type, isDark }: PopulationChartProps) {
  return (
    <div className="h-[340px] w-full sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PopulationChartBody data={data} type={type} palette={CHART_PALETTES[isDark ? 'dark' : 'light']} />
      </ResponsiveContainer>
    </div>
  );
}
