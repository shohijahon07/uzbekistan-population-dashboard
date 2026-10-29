const DEFAULT_LOCALE = 'en-US';
const cache = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: string, key: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const id = `${locale}|${key}`;
  let formatter = cache.get(id);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(id, formatter);
  }
  return formatter;
}

/** 38660000 -> "38,660,000" (en) / "38 660 000" (ru, uz) */
export const formatNumber = (value: number, locale = DEFAULT_LOCALE): string =>
  numberFormat(locale, 'full', {}).format(value);

/** 38660000 -> "38.7M" (en) / "38,7 млн" (ru) / "38,7 mln" (uz) */
export const formatCompact = (value: number, locale = DEFAULT_LOCALE): string =>
  numberFormat(locale, 'compact', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

/** 12.345 -> "+12.35%" */
export const formatPercent = (value: number, locale = DEFAULT_LOCALE, digits = 2): string =>
  `${numberFormat(locale, `pct${digits}`, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: 'exceptZero',
  }).format(value)}%`;

/** 17860000 -> "+17,860,000" */
export const formatSigned = (value: number, locale = DEFAULT_LOCALE): string =>
  numberFormat(locale, 'signed', { signDisplay: 'exceptZero' }).format(value);

export const formatDateTime = (date: Date, locale = DEFAULT_LOCALE): string =>
  date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
