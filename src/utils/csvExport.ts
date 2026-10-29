import type { Messages } from '../i18n/translations';
import type { PopulationPoint } from '../types';
import { withYearOverYear } from './stats';

const UTF8_BOM = String.fromCharCode(0xfeff);

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const escapeCsv = (value: string | number): string => {
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Sarlavhalar tanlangan tilda, raqamlar esa Excel/importga qulay "xom" ko'rinishda. */
export function exportPopulationCsv(points: PopulationPoint[], fileName: string, labels: Messages['table']): void {
  const header = [labels.year, labels.population, labels.change, labels.changePercent];
  const rows = withYearOverYear(points).map((r) => [
    r.year,
    r.population,
    r.change ?? '',
    r.changePercent === null ? '' : r.changePercent.toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');

  // BOM — Excel UTF-8 (kirill harflari) ni to'g'ri tanishi uchun
  downloadBlob(new Blob([UTF8_BOM + csv], { type: 'text/csv;charset=utf-8' }), fileName);
}
