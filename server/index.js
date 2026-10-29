import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { populationSeries, MIN_YEAR, MAX_YEAR } from './data.js';

// API_PORT — lokal dev uchun; PORT — Heroku kabi platformalar beradigan port.
const PORT = Number(process.env.API_PORT || process.env.PORT) || 5000;
/** Tarmoq kechikishi emulyatsiyasi (ms). ?delay=... bilan so'rov darajasida o'zgartiriladi. */
const DEFAULT_DELAY_MS = Number(process.env.API_DELAY_MS ?? 800);
/** Tasodifiy xatolik ehtimoli (0..1). Masalan: API_FAILURE_RATE=0.2 */
const FAILURE_RATE = Number(process.env.API_FAILURE_RATE ?? 0);
const MAX_DELAY_MS = 10_000;

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseYear = (value) => {
  if (value === undefined) return undefined;
  const year = Number(value);
  return Number.isInteger(year) ? year : NaN;
};

const sendError = (res, status, code, message) =>
  res.status(status).json({ error: { code, message } });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

/**
 * GET /api/population
 * Query parametrlari (ixtiyoriy):
 *   from, to  — yillar oralig'i (masalan ?from=2000&to=2026)
 *   delay     — javob kechikishi, ms (0..10000)
 *   fail      — "true" bo'lsa 500 xatolik qaytaradi (error state'ni tekshirish uchun)
 */
app.get('/api/population', async (req, res) => {
  const requestedDelay = req.query.delay !== undefined ? Number(req.query.delay) : NaN;
  const baseDelay = Number.isFinite(requestedDelay)
    ? requestedDelay
    : DEFAULT_DELAY_MS + Math.round(Math.random() * 400); // jitter
  await sleep(Math.min(Math.max(baseDelay, 0), MAX_DELAY_MS));

  if (req.query.fail === 'true' || Math.random() < FAILURE_RATE) {
    return sendError(res, 500, 'INTERNAL_ERROR', "Ma'lumotlarni yuklashda server xatoligi yuz berdi.");
  }

  const from = parseYear(req.query.from) ?? MIN_YEAR;
  const to = parseYear(req.query.to) ?? MAX_YEAR;

  if (Number.isNaN(from) || Number.isNaN(to)) {
    return sendError(res, 400, 'INVALID_YEAR', "'from' va 'to' butun son (yil) bo'lishi kerak.");
  }
  if (from > to) {
    return sendError(res, 400, 'INVALID_RANGE', "'from' qiymati 'to' dan katta bo'lmasligi kerak.");
  }
  if (from < MIN_YEAR || to > MAX_YEAR) {
    return sendError(res, 400, 'OUT_OF_RANGE', `Yillar ${MIN_YEAR}-${MAX_YEAR} oralig'ida bo'lishi kerak.`);
  }

  res.set('Cache-Control', 'no-store');
  res.json({
    country: 'Uzbekistan',
    unit: 'people',
    data: populationSeries.filter((p) => p.year >= from && p.year <= to),
  });
});

app.use('/api', (_req, res) => sendError(res, 404, 'NOT_FOUND', 'Endpoint topilmadi.'));

// Production: build qilingan frontendni ham shu server orqali tarqatamiz (npm start).
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  sendError(res, 500, 'INTERNAL_ERROR', 'Kutilmagan server xatoligi.');
});

const server = app.listen(PORT, () => {
  console.log(`Mock API: http://localhost:${PORT}/api/population (delay ~${DEFAULT_DELAY_MS}ms)`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
