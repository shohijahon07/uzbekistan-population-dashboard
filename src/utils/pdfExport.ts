import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
// jsPDF'ning standart shriftlari (Helvetica) kirill harflarini qo'llamaydi — DejaVu Sans ulanadi.
import fontRegularUrl from 'dejavu-fonts-ttf/ttf/DejaVuSans.ttf?url';
import fontBoldUrl from 'dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf?url';
import { EXPORT_CHART_ATTR } from '../constants';
import type { Messages } from '../i18n/translations';
import type { PopulationPoint, PopulationStats } from '../types';
import { formatDateTime, formatNumber, formatPercent, formatSigned } from './format';
import { withYearOverYear } from './stats';

export interface PdfExportOptions {
  /** PDF uchun alohida (light, animatsiyasiz) render qilingan grafik konteyneri */
  chartElement: HTMLElement;
  data: PopulationPoint[];
  stats: PopulationStats;
  fileName: string;
  /** Tanlangan tildagi matnlar */
  t: Messages;
  /** Raqam va sanalar formati uchun locale */
  locale: string;
}

// A4: 210 x 297 mm
const PAGE = { width: 210, height: 297, margin: 15 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const FONT = 'DejaVuSans';

type RGB = [number, number, number];
const COLORS = {
  brand: [79, 70, 229] as RGB,
  dark: [15, 23, 42] as RGB,
  text: [51, 65, 85] as RGB,
  muted: [100, 116, 139] as RGB,
  border: [226, 232, 240] as RGB,
  surface: [248, 250, 252] as RGB,
  positive: [5, 150, 105] as RGB,
  white: [255, 255, 255] as RGB,
};

// Shriftlar bir marta yuklanadi va keyingi eksportlarda qayta ishlatiladi.
let fontCache: Promise<{ regular: string; bold: string }> | null = null;

async function fetchAsBase64(url: string): Promise<string> {
  const buffer = await (await fetch(url)).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function registerFonts(doc: jsPDF): Promise<void> {
  fontCache ??= Promise.all([fetchAsBase64(fontRegularUrl), fetchAsBase64(fontBoldUrl)])
    .then(([regular, bold]) => ({ regular, bold }))
    .catch((err) => {
      fontCache = null;
      throw err;
    });
  const { regular, bold } = await fontCache;
  doc.addFileToVFS('DejaVuSans.ttf', regular);
  doc.addFont('DejaVuSans.ttf', FONT, 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', bold);
  doc.addFont('DejaVuSans-Bold.ttf', FONT, 'bold');
}

async function captureChart(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    // Element ekrandan tashqarida turadi — klonda uni ko'rinadigan joyga olib chiqamiz.
    onclone: (clonedDoc) => {
      const clone = clonedDoc.querySelector<HTMLElement>(`[${EXPORT_CHART_ATTR}]`);
      if (clone) {
        clone.style.left = '0px';
        clone.style.top = '0px';
      }
    },
  });
}

/** Matn berilgan kenglikka sig'maguncha shrift o'lchamini kamaytiradi (uzun tarjimalar uchun). */
function setFittingFontSize(doc: jsPDF, text: string, maxWidth: number, size: number, minSize = 6): void {
  doc.setFontSize(size);
  while (size > minSize && doc.getTextWidth(text) > maxWidth) {
    size -= 0.5;
    doc.setFontSize(size);
  }
}

function drawHeader(doc: jsPDF, t: Messages, locale: string, stats: PopulationStats, generatedAt: Date) {
  doc.setFillColor(...COLORS.brand);
  doc.rect(0, 0, PAGE.width, 34, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFont(FONT, 'bold');
  setFittingFontSize(doc, t.pdf.title, CONTENT_WIDTH, 20);
  doc.text(t.pdf.title, PAGE.margin, 16);

  doc.setFont(FONT, 'normal');
  doc.setFontSize(10);
  doc.text(`${t.pdf.period}: ${stats.fromYear} – ${stats.toYear}`, PAGE.margin, 25);
  doc.text(`${t.pdf.generated}: ${formatDateTime(generatedAt, locale)}`, PAGE.width - PAGE.margin, 25, { align: 'right' });
}

function drawSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setTextColor(...COLORS.dark);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(12);
  doc.text(title, PAGE.margin, y);
}

function drawKpis(doc: jsPDF, t: Messages, locale: string, stats: PopulationStats, y: number): number {
  const kpis = [
    { label: t.kpi.population, value: formatNumber(stats.latest, locale), hint: t.kpi.asOf(stats.toYear) },
    { label: t.kpi.initial, value: formatNumber(stats.initial, locale), hint: t.kpi.asOf(stats.fromYear) },
    { label: t.kpi.totalGrowth, value: formatSigned(stats.totalGrowth, locale), hint: t.kpi.during(stats.fromYear, stats.toYear) },
    {
      label: t.kpi.growthPercent,
      value: formatPercent(stats.growthPercent, locale),
      hint: t.pdf.cagrPerYear(formatPercent(stats.cagr, locale)),
    },
  ];
  const gap = 4;
  const boxW = (CONTENT_WIDTH - gap * (kpis.length - 1)) / kpis.length;
  const boxH = 24;
  const innerW = boxW - 8;

  kpis.forEach((kpi, i) => {
    const x = PAGE.margin + i * (boxW + gap);
    doc.setFillColor(...COLORS.surface);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'FD');

    doc.setFont(FONT, 'normal');
    doc.setTextColor(...COLORS.muted);
    setFittingFontSize(doc, kpi.label, innerW, 8);
    doc.text(kpi.label, x + 4, y + 7);

    doc.setFont(FONT, 'bold');
    doc.setTextColor(...(i >= 2 ? COLORS.positive : COLORS.dark));
    setFittingFontSize(doc, kpi.value, innerW, 12);
    doc.text(kpi.value, x + 4, y + 15);

    doc.setFont(FONT, 'normal');
    doc.setTextColor(...COLORS.muted);
    setFittingFontSize(doc, kpi.hint, innerW, 7);
    doc.text(kpi.hint, x + 4, y + 20.5);
  });

  return y + boxH;
}

/** Yillik jadval — joyni tejash uchun 3 ustunga bo'lingan. */
function drawTable(doc: jsPDF, t: Messages, locale: string, data: PopulationPoint[], startY: number): number {
  const rows = withYearOverYear(data);
  const columns = 3;
  const gap = 5;
  const colW = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
  const rowH = 5.2;
  const headerH = 6.5;
  let y = startY;
  let remaining = rows;

  while (remaining.length > 0) {
    const maxRowsPerCol = Math.max(1, Math.floor((PAGE.height - PAGE.margin - 10 - y - headerH) / rowH));
    const perCol = Math.min(maxRowsPerCol, Math.ceil(remaining.length / columns));
    const chunk = remaining.slice(0, perCol * columns);
    remaining = remaining.slice(chunk.length);

    for (let c = 0; c < columns; c++) {
      const colRows = chunk.slice(c * perCol, (c + 1) * perCol);
      if (colRows.length === 0) continue;
      const x = PAGE.margin + c * (colW + gap);

      doc.setFillColor(...COLORS.dark);
      doc.rect(x, y, colW, headerH, 'F');
      doc.setFont(FONT, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.white);
      doc.text(t.table.year, x + 2, y + 4.3);
      doc.text(t.table.population, x + colW * 0.64, y + 4.3, { align: 'right' });
      doc.text(t.table.yoy, x + colW - 2, y + 4.3, { align: 'right' });

      colRows.forEach((row, r) => {
        const ry = y + headerH + r * rowH;
        if (r % 2 === 1) {
          doc.setFillColor(...COLORS.surface);
          doc.rect(x, ry, colW, rowH, 'F');
        }
        doc.setFont(FONT, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.text);
        doc.text(String(row.year), x + 2, ry + 3.6);
        doc.text(formatNumber(row.population, locale), x + colW * 0.64, ry + 3.6, { align: 'right' });
        doc.setTextColor(...(row.changePercent === null ? COLORS.muted : COLORS.positive));
        doc.text(row.changePercent === null ? '—' : formatPercent(row.changePercent, locale), x + colW - 2, ry + 3.6, {
          align: 'right',
        });
      });
    }

    y += headerH + perCol * rowH;
    if (remaining.length > 0) {
      doc.addPage();
      y = PAGE.margin;
    }
  }
  return y;
}

function drawFooters(doc: jsPDF, t: Messages) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const y = PAGE.height - 8;
    const pageLabel = t.pdf.page(i, pages);
    doc.setDrawColor(...COLORS.border);
    doc.line(PAGE.margin, y - 4, PAGE.width - PAGE.margin, y - 4);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7.5);
    doc.text(pageLabel, PAGE.width - PAGE.margin, y, { align: 'right' });
    setFittingFontSize(doc, t.pdf.source, CONTENT_WIDTH - doc.getTextWidth(pageLabel) - 6, 7.5);
    doc.text(t.pdf.source, PAGE.margin, y);
  }
}

export async function exportPopulationPdf({ chartElement, data, stats, fileName, t, locale }: PdfExportOptions): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const [canvas] = await Promise.all([captureChart(chartElement), registerFonts(doc)]);
  const generatedAt = new Date();

  doc.setProperties({
    title: `${t.pdf.title} ${stats.fromYear}–${stats.toYear}`,
    subject: t.pdf.trend,
    creator: 'Population Dashboard',
  });

  drawHeader(doc, t, locale, stats, generatedAt);

  let y = 46;
  drawSectionTitle(doc, t.pdf.keyIndicators, y);
  y = drawKpis(doc, t, locale, stats, y + 4) + 10;

  drawSectionTitle(doc, t.pdf.trend, y);
  y += 4;
  const padding = 3;
  const imgW = CONTENT_WIDTH - padding * 2;
  const imgH = (imgW * canvas.height) / canvas.width;
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(PAGE.margin, y, CONTENT_WIDTH, imgH + padding * 2, 2, 2, 'S');
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', PAGE.margin + padding, y + padding, imgW, imgH);
  y += imgH + padding * 2 + 10;

  drawSectionTitle(doc, t.pdf.annualData, y);
  drawTable(doc, t, locale, data, y + 4);

  drawFooters(doc, t);
  doc.save(fileName);
}
