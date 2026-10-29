import type { LucideIcon } from 'lucide-react';
import { Percent, TrendingUp, Users, UserRound } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import type { PopulationStats } from '../types';
import { formatCompact, formatNumber, formatPercent, formatSigned } from '../utils/format';

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  accent: string;
}

function StatCard({ label, value, hint, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`rounded-lg p-2 ${accent}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

export function StatsCards({ stats }: { stats: PopulationStats }) {
  const { t, locale } = useI18n();

  const cards: StatCardProps[] = [
    {
      label: t.kpi.population,
      value: formatNumber(stats.latest, locale),
      hint: `${t.kpi.asOf(stats.toYear)} (${formatCompact(stats.latest, locale)})`,
      icon: Users,
      accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    },
    {
      label: t.kpi.initial,
      value: formatNumber(stats.initial, locale),
      hint: `${t.kpi.asOf(stats.fromYear)} (${formatCompact(stats.initial, locale)})`,
      icon: UserRound,
      accent: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    },
    {
      label: t.kpi.totalGrowth,
      value: formatSigned(stats.totalGrowth, locale),
      hint: t.kpi.during(stats.fromYear, stats.toYear),
      icon: TrendingUp,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      label: t.kpi.growthPercent,
      value: formatPercent(stats.growthPercent, locale),
      hint: t.kpi.avgAnnual(formatPercent(stats.cagr, locale)),
      icon: Percent,
      accent: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    },
  ];

  return (
    <section aria-label={t.kpi.sectionLabel} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </section>
  );
}
