import { Languages } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { LANGUAGES } from '../i18n/translations';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
    >
      <Languages className="ml-1.5 mr-0.5 h-4 w-4 text-slate-400" aria-hidden />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          title={lang.name}
          aria-label={lang.name}
          aria-pressed={language === lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            language === lang.code
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
