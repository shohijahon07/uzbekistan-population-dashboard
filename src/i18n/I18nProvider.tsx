import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language } from '../types';
import { DEFAULT_LANGUAGE, LANGUAGES, translations, type Messages } from './translations';

const STORAGE_KEY = 'language';

interface I18nContextValue {
  language: Language;
  /** Intl uchun locale, masalan "ru-RU" */
  locale: string;
  t: Messages;
  setLanguage: (language: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const isLanguage = (value: unknown): value is Language => LANGUAGES.some((l) => l.code === value);

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    /* localStorage mavjud emas */
  }
  return DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language].header.title;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* e'tiborsiz qoldiramiz */
    }
  }, [language]);

  const setLanguage = useCallback((next: Language) => setLanguageState(next), []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      locale: LANGUAGES.find((l) => l.code === language)!.locale,
      t: translations[language],
      setLanguage,
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
