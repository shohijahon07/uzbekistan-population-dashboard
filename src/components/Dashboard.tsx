import { forwardRef, useMemo, useRef, useState } from 'react';
import { BarChart3, FileDown, FileSpreadsheet, LineChart as LineChartIcon, Loader2, Moon, Sun, X } from 'lucide-react';
import { EXPORT_CHART_ATTR } from '../constants';
import { usePopulation } from '../hooks/usePopulation';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../i18n/I18nProvider';
import type { ChartType, PopulationPoint, RangeSelection } from '../types';
import { exportPopulationCsv } from '../utils/csvExport';
import { computeStats, filterByRange, RANGE_PRESETS } from '../utils/stats';
import { FilterBar } from './FilterBar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CHART_PALETTES, PopulationChart, PopulationChartBody } from './PopulationChart';
import { DashboardSkeleton, ErrorState } from './States';
import { StatsCards } from './StatsCards';

const DEFAULT_RANGE: RangeSelection = { preset: '1991-2026', from: RANGE_PRESETS[0].from, to: RANGE_PRESETS[0].to };

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButton = `${buttonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`;
const primaryButton = `${buttonBase} bg-indigo-600 text-white shadow-sm hover:bg-indigo-500`;

/**
 * PDF uchun grafik: har doim light rangda, animatsiyasiz va qat'iy o'lchamda.
 * Ekrandan tashqarida render qilinadi, shuning uchun foydalanuvchiga ko'rinmaydi.
 */
const ExportChart = forwardRef<HTMLDivElement, { data: PopulationPoint[]; type: ChartType }>(({ data, type }, ref) => (
  <div
    ref={ref}
    {...{ [EXPORT_CHART_ATTR]: '' }}
    aria-hidden
    style={{ position: 'fixed', left: -10000, top: 0, width: 1000, height: 440, background: '#fff', pointerEvents: 'none' }}
  >
    <PopulationChartBody
      data={data}
      type={type}
      palette={CHART_PALETTES.light}
      width={1000}
      height={440}
      animate={false}
      showTooltip={false}
      fontSize={17}
    />
  </div>
));
ExportChart.displayName = 'ExportChart';

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { t, locale } = useI18n();
  const { state, retry } = usePopulation();
  const [range, setRange] = useState<RangeSelection>(DEFAULT_RANGE);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const exportChartRef = useRef<HTMLDivElement>(null);

  const response = state.status === 'success' ? state.data : null;
  const years = useMemo(() => response?.data.map((p) => p.year) ?? [], [response]);
  const filtered = useMemo(() => (response ? filterByRange(response.data, range) : []), [response, range]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const fileBase = stats ? `uzbekistan-population-${stats.fromYear}-${stats.toYear}` : 'uzbekistan-population';

  const handlePdfExport = async () => {
    if (!stats || !exportChartRef.current) return;
    setIsExporting(true);
    setExportFailed(false);
    try {
      // html2canvas + jsPDF + shriftlar faqat kerak bo'lganda yuklanadi (code splitting)
      const { exportPopulationPdf } = await import('../utils/pdfExport');
      await exportPopulationPdf({
        chartElement: exportChartRef.current,
        data: filtered,
        stats,
        fileName: `${fileBase}.pdf`,
        t,
        locale,
      });
    } catch (err) {
      console.error(err);
      setExportFailed(true);
    } finally {
      setIsExporting(false);
    }
  };

  const hasData = state.status === 'success' && stats !== null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t.header.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{t.header.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.header.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggleTheme}
              className={secondaryButton}
              aria-label={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? t.theme.light : t.theme.dark}
            </button>
          </div>
        </header>

        {/* Toolbar: filter + export */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterBar value={range} years={years} onChange={setRange} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButton}
              disabled={!hasData}
              onClick={() => exportPopulationCsv(filtered, `${fileBase}.csv`, t.table)}
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
              {t.actions.csv}
            </button>
            <button type="button" className={primaryButton} disabled={!hasData || isExporting} onClick={handlePdfExport}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileDown className="h-4 w-4" aria-hidden />}
              {isExporting ? t.actions.pdfPreparing : t.actions.pdf}
            </button>
          </div>
        </div>

        {exportFailed && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          >
            {t.actions.pdfError}
            <button type="button" onClick={() => setExportFailed(false)} aria-label={t.actions.close}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <main className="mt-6">
          {state.status === 'loading' && <DashboardSkeleton />}
          {state.status === 'error' && <ErrorState message={t.errors[state.error](state.httpStatus)} onRetry={retry} />}

          {state.status === 'success' && !stats && (
            <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              {t.states.empty}
            </p>
          )}

          {state.status === 'success' && stats && (
            <div className="space-y-6">
              <StatsCards stats={stats} />

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold">{t.chart.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t.chart.meta(stats.fromYear, stats.toYear, filtered.length)}
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-label={t.chart.typeLabel}
                    className="flex gap-1 self-start rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70"
                  >
                    {(
                      [
                        { type: 'line', label: t.chart.line, icon: LineChartIcon },
                        { type: 'bar', label: t.chart.bar, icon: BarChart3 },
                      ] as const
                    ).map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={chartType === type}
                        onClick={() => setChartType(type)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          chartType === type
                            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <PopulationChart data={filtered} type={chartType} isDark={theme === 'dark'} />
              </section>

              <ExportChart ref={exportChartRef} data={filtered} type={chartType} />
            </div>
          )}
        </main>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {t.footer}
        </footer>
      </div>
    </div>
  );
}
