import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const pulse = 'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800';

export function DashboardSkeleton() {
  const { t } = useI18n();

  return (
    <div aria-busy="true" aria-label={t.states.loading} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className={`${pulse} h-4 w-24`} />
            <div className={`${pulse} mt-4 h-7 w-36`} />
            <div className={`${pulse} mt-2 h-3 w-28`} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between">
          <div className={`${pulse} h-5 w-48`} />
          <div className={`${pulse} h-8 w-32`} />
        </div>
        <div className={`${pulse} mt-6 h-[340px] w-full sm:h-[400px]`} />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useI18n();

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900/50 dark:bg-red-950/30"
    >
      <span className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/40 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{t.states.errorTitle}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        {t.states.retry}
      </button>
    </div>
  );
}
