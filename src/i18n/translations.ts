import type { ApiErrorKind, Language } from '../types';

export interface LanguageOption {
  code: Language;
  label: string;
  name: string;
  /** Intl API uchun locale */
  locale: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'uz', label: 'UZ', name: "O'zbekcha", locale: 'uz-Latn-UZ' },
  { code: 'en', label: 'EN', name: 'English', locale: 'en-US' },
  { code: 'ru', label: 'RU', name: 'Русский', locale: 'ru-RU' },
];

export const DEFAULT_LANGUAGE: Language = 'uz';

export interface Messages {
  header: { eyebrow: string; title: string; subtitle: string };
  theme: { light: string; dark: string; toLight: string; toDark: string };
  language: string;
  filter: { groupLabel: string; custom: string; from: string; to: string };
  actions: { csv: string; pdf: string; pdfPreparing: string; pdfError: string; close: string };
  kpi: {
    sectionLabel: string;
    population: string;
    initial: string;
    totalGrowth: string;
    growthPercent: string;
    asOf: (year: number) => string;
    during: (from: number, to: number) => string;
    avgAnnual: (value: string) => string;
  };
  chart: {
    title: string;
    meta: (from: number, to: number, years: number) => string;
    typeLabel: string;
    line: string;
    bar: string;
    people: string;
    yearOverYear: string;
  };
  states: { loading: string; errorTitle: string; retry: string; empty: string };
  errors: Record<ApiErrorKind, (status?: number) => string>;
  footer: string;
  table: { year: string; population: string; change: string; changePercent: string; yoy: string };
  pdf: {
    title: string;
    period: string;
    generated: string;
    keyIndicators: string;
    trend: string;
    annualData: string;
    cagrPerYear: (value: string) => string;
    source: string;
    page: (current: number, total: number) => string;
  };
}

const uz: Messages = {
  header: {
    eyebrow: 'Demografik statistika',
    title: "O'zbekiston aholisi dinamikasi",
    subtitle: "O'zbekiston aholisi soni, 1991–2026 (2026 — prognoz)",
  },
  theme: { light: "Yorug'", dark: "Qorong'i", toLight: "Yorug' rejimga o'tish", toDark: "Qorong'i rejimga o'tish" },
  language: 'Til',
  filter: { groupLabel: "Davr oralig'i", custom: 'Boshqa', from: 'Dan', to: 'gacha' },
  actions: {
    csv: 'CSV',
    pdf: 'PDF yuklab olish',
    pdfPreparing: 'Tayyorlanmoqda...',
    pdfError: "PDF yaratishda xatolik yuz berdi. Qayta urinib ko'ring.",
    close: 'Yopish',
  },
  kpi: {
    sectionLabel: "Asosiy ko'rsatkichlar",
    population: 'Aholi soni',
    initial: "Boshlang'ich aholi soni",
    totalGrowth: "Umumiy o'sish",
    growthPercent: "O'sish %",
    asOf: (y) => `${y}-yil holatiga`,
    during: (a, b) => `${a}–${b} davomida`,
    avgAnnual: (v) => `O'rtacha yillik: ${v}`,
  },
  chart: {
    title: 'Aholi soni dinamikasi',
    meta: (a, b, n) => `${a}–${b} · ${n} yil · birlik: kishi`,
    typeLabel: 'Grafik turi',
    line: 'Chiziqli',
    bar: 'Ustunli',
    people: 'kishi',
    yearOverYear: 'yillik',
  },
  states: {
    loading: 'Yuklanmoqda',
    errorTitle: "Ma'lumotlarni yuklab bo'lmadi",
    retry: 'Qayta urinish',
    empty: "Tanlangan davr uchun ma'lumot topilmadi.",
  },
  errors: {
    network: () => "Serverga ulanib bo'lmadi. Mock API (5000-port) ishga tushirilganini tekshiring.",
    timeout: () => "Server javob bermadi (timeout). Keyinroq qayta urinib ko'ring.",
    server: (s) => `Serverda xatolik yuz berdi${s ? ` (HTTP ${s})` : ''}.`,
    invalid: () => "Serverdan noto'g'ri formatdagi ma'lumot keldi.",
  },
  footer: "Manba: O'zbekiston Respublikasi Statistika agentligi ma'lumotlari asosida taxminiy qiymatlar. 2026-yil — prognoz.",
  table: { year: 'Yil', population: 'Aholi soni', change: "O'zgarish", changePercent: "O'zgarish %", yoy: 'Yillik' },
  pdf: {
    title: "O'zbekiston aholisi dinamikasi",
    period: 'Davr',
    generated: 'Yaratilgan sana',
    keyIndicators: "Asosiy ko'rsatkichlar",
    trend: 'Aholi soni dinamikasi',
    annualData: "Yillik ma'lumotlar",
    cagrPerYear: (v) => `O'rtacha yillik ${v}`,
    source: "Manba: O'zbekiston Respublikasi Prezidenti huzuridagi Statistika agentligi (taxminiy)",
    page: (i, n) => `${i} / ${n} sahifa`,
  },
};

const en: Messages = {
  header: {
    eyebrow: 'Demographic statistics',
    title: 'Uzbekistan Population Dynamics',
    subtitle: 'Population of Uzbekistan, 1991–2026 (2026 — forecast)',
  },
  theme: { light: 'Light', dark: 'Dark', toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
  language: 'Language',
  filter: { groupLabel: 'Period', custom: 'Custom', from: 'From', to: 'to' },
  actions: {
    csv: 'CSV',
    pdf: 'Download PDF',
    pdfPreparing: 'Preparing...',
    pdfError: 'Failed to generate the PDF. Please try again.',
    close: 'Close',
  },
  kpi: {
    sectionLabel: 'Key indicators',
    population: 'Population',
    initial: 'Initial Population',
    totalGrowth: 'Total Growth',
    growthPercent: 'Growth %',
    asOf: (y) => `As of ${y}`,
    during: (a, b) => `Over ${a}–${b}`,
    avgAnnual: (v) => `Average annual: ${v}`,
  },
  chart: {
    title: 'Population dynamics',
    meta: (a, b, n) => `${a}–${b} · ${n} years · unit: people`,
    typeLabel: 'Chart type',
    line: 'Line',
    bar: 'Bar',
    people: 'people',
    yearOverYear: 'year over year',
  },
  states: {
    loading: 'Loading',
    errorTitle: 'Failed to load data',
    retry: 'Try again',
    empty: 'No data for the selected period.',
  },
  errors: {
    network: () => 'Could not connect to the server. Make sure the mock API (port 5000) is running.',
    timeout: () => 'The server did not respond (timeout). Please try again later.',
    server: (s) => `The server returned an error${s ? ` (HTTP ${s})` : ''}.`,
    invalid: () => 'The server returned data in an unexpected format.',
  },
  footer: 'Source: estimates based on data from the Statistics Agency of the Republic of Uzbekistan. 2026 — forecast.',
  table: { year: 'Year', population: 'Population', change: 'Change', changePercent: 'Change %', yoy: 'YoY' },
  pdf: {
    title: 'Uzbekistan Population Dynamics',
    period: 'Period',
    generated: 'Generated',
    keyIndicators: 'Key indicators',
    trend: 'Population trend',
    annualData: 'Annual data',
    cagrPerYear: (v) => `CAGR ${v} / year`,
    source: 'Source: Statistics Agency under the President of the Republic of Uzbekistan (approx.)',
    page: (i, n) => `Page ${i} of ${n}`,
  },
};

const ru: Messages = {
  header: {
    eyebrow: 'Демографическая статистика',
    title: 'Динамика населения Узбекистана',
    subtitle: 'Численность населения Узбекистана, 1991–2026 (2026 — прогноз)',
  },
  theme: { light: 'Светлая', dark: 'Тёмная', toLight: 'Включить светлую тему', toDark: 'Включить тёмную тему' },
  language: 'Язык',
  filter: { groupLabel: 'Период', custom: 'Свой период', from: 'С', to: 'по' },
  actions: {
    csv: 'CSV',
    pdf: 'Скачать PDF',
    pdfPreparing: 'Подготовка...',
    pdfError: 'Не удалось создать PDF. Попробуйте ещё раз.',
    close: 'Закрыть',
  },
  kpi: {
    sectionLabel: 'Ключевые показатели',
    population: 'Население',
    initial: 'Начальная численность',
    totalGrowth: 'Общий прирост',
    growthPercent: 'Прирост %',
    asOf: (y) => `На ${y} год`,
    during: (a, b) => `За ${a}–${b}`,
    avgAnnual: (v) => `Среднегодовой: ${v}`,
  },
  chart: {
    title: 'Динамика численности населения',
    meta: (a, b, n) => `${a}–${b} · ${n} лет · ед.: человек`,
    typeLabel: 'Тип графика',
    line: 'Линия',
    bar: 'Столбцы',
    people: 'чел.',
    yearOverYear: 'за год',
  },
  states: {
    loading: 'Загрузка',
    errorTitle: 'Не удалось загрузить данные',
    retry: 'Повторить',
    empty: 'Нет данных за выбранный период.',
  },
  errors: {
    network: () => 'Не удалось подключиться к серверу. Проверьте, что mock API (порт 5000) запущен.',
    timeout: () => 'Сервер не ответил (timeout). Попробуйте позже.',
    server: (s) => `Ошибка на сервере${s ? ` (HTTP ${s})` : ''}.`,
    invalid: () => 'Сервер вернул данные в неверном формате.',
  },
  footer: 'Источник: оценочные данные на основе Агентства статистики Республики Узбекистан. 2026 — прогноз.',
  table: { year: 'Год', population: 'Население', change: 'Изменение', changePercent: 'Изменение %', yoy: 'Г/г' },
  pdf: {
    title: 'Динамика населения Узбекистана',
    period: 'Период',
    generated: 'Дата создания',
    keyIndicators: 'Ключевые показатели',
    trend: 'Динамика численности населения',
    annualData: 'Данные по годам',
    cagrPerYear: (v) => `Среднегодовой ${v}`,
    source: 'Источник: Агентство статистики при Президенте Республики Узбекистан (оценка)',
    page: (i, n) => `Стр. ${i} из ${n}`,
  },
};

export const translations: Record<Language, Messages> = { uz, en, ru };
