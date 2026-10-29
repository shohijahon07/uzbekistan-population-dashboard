# Uzbekistan Population Dynamics (1991–2026)

O'zbekiston aholisi dinamikasini ko'rsatuvchi dashboard: KPI kartalar, interaktiv grafik (Line/Bar),
davr filtri, A4 PDF va CSV eksport, Dark/Light rejim, 3 tilli interfeys (O'zbekcha / English / Русский).

**Stack:** Node.js + Express (mock API) · React 18 + TypeScript + Vite · Tailwind CSS · Recharts ·
html2canvas + jsPDF · Lucide React

## Talablar

- Node.js **18.11+** (`node --watch` uchun), npm 9+

## Ishga tushirish

```bash
npm install
npm run dev
```

`npm run dev` ikkala serverni birga ishga tushiradi:

| Servis   | Manzil                                   |
| -------- | ---------------------------------------- |
| Frontend | http://localhost:5173                    |
| Mock API | http://localhost:5000/api/population     |

Vite `/api/*` so'rovlarini 5000-portga proksi qiladi, shuning uchun CORS sozlash shart emas.

### Boshqa skriptlar

| Buyruq               | Vazifasi                                                           |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev:server` | Faqat mock API (watch rejimida)                                    |
| `npm run dev:client` | Faqat frontend                                                     |
| `npm run build`      | Type-check + production build (`dist/`)                            |
| `npm start`          | Production: build qilingan frontend + API bitta serverda (`npm run build` dan keyin) |
| `npm run typecheck`  | Faqat TypeScript tekshiruvi                                        |

## Heroku'ga deploy

Loyiha Heroku'ga tayyor: `Procfile` (`web: node server/index.js`), Node buildpack `npm run build` ni avtomatik
bajaradi, Express esa `dist/` va `/api/*` ni Heroku bergan `PORT` da tarqatadi.

```bash
heroku create <app-nomi>
git push heroku main
heroku open
```

## Mock API

`GET /api/population`

```json
{
  "country": "Uzbekistan",
  "unit": "people",
  "data": [
    { "year": 1991, "population": 20800000 },
    { "year": 2026, "population": 38660000 }
  ]
}
```

| Query parametr | Tavsif                                                       |
| -------------- | ------------------------------------------------------------ |
| `from`, `to`   | Yillar oralig'i (masalan `?from=2000&to=2026`), validatsiyali |
| `delay`        | Javob kechikishi, ms (0–10000). Default ≈ 800–1200 ms        |
| `fail=true`    | 500 xatolik qaytaradi (error state'ni tekshirish uchun)      |

Xatolik formati: `{ "error": { "code": "INVALID_RANGE", "message": "..." } }` (400 / 404 / 500).

| Muhit o'zgaruvchisi | Default | Tavsif                              |
| ------------------- | ------- | ----------------------------------- |
| `API_PORT` / `PORT` | `5000`  | API porti (`PORT` — Heroku uchun)  |
| `API_DELAY_MS`      | `800`   | Bazaviy kechikish                   |
| `API_FAILURE_RATE`  | `0`     | Tasodifiy xatolik ehtimoli (0..1)   |
| `VITE_API_URL`      | `''`    | Frontend uchun API bazaviy manzili  |

### Loading va error holatlarini brauzerda tekshirish

- http://localhost:5173/?delay=4000 — skeleton loading uzoqroq ko'rinadi
- http://localhost:5173/?simulateError=1 — error state va "Qayta urinish" tugmasi

## Funksionallik

- **KPI:** Population (davrdagi so'nggi qiymat), Initial Population, Total Growth, Growth % (+ o'rtacha yillik o'sish, CAGR)
- **Grafik:** responsive Line chart, Bar chartga almashtirish, har bir nuqtada tooltip (qiymat + yillik o'zgarish)
- **Filtr:** 1991–2026, 2000–2026, 2010–2026, Custom (boshlang'ich/yakuniy yil; noto'g'ri oraliq tanlab bo'lmaydi)
- **PDF (A4):** sarlavha "Uzbekistan Population Dynamics", davr, generated date, KPI bloklar, grafik va yillik jadval.
  Fayl nomi tanlangan davrga mos: standart holatda `uzbekistan-population-1991-2026.pdf`
- **Til tanlash (UZ / EN / RU):** butun interfeys, raqam/sana formati (`38 660 000`, `38,7 млн`), xatolik xabarlari,
  CSV sarlavhalari va PDF hisobot tanlangan tilda. Tanlov `localStorage`da saqlanadi, standart til — o'zbekcha
- **CSV eksport**, **Dark/Light** rejim (tanlov saqlanadi), **skeleton loading**, **error state**

## Loyiha tuzilmasi

```
server/
  index.js              Express mock API (latency, xatolik emulyatsiyasi, validatsiya)
  data.js               1991–2026 aholi ma'lumotlari
src/
  types/index.ts        Umumiy TypeScript tiplari
  services/api.ts       API client (timeout, abort, javob validatsiyasi)
  hooks/                usePopulation (fetch + retry), useTheme
  i18n/
    translations.ts     UZ / EN / RU matnlari (tiplangan)
    I18nProvider.tsx    Til konteksti va useI18n() hook
  components/
    Dashboard.tsx       Asosiy sahifa: filtr, KPI, grafik, eksport tugmalari
    StatsCards.tsx      KPI kartalar
    PopulationChart.tsx Line/Bar grafik (Recharts)
    FilterBar.tsx       Davr filtri
    States.tsx          Skeleton va error holatlari
    LanguageSwitcher.tsx Til almashtirgich
  utils/
    pdfExport.ts        A4 PDF (html2canvas + jsPDF), lazy-load qilinadi
    csvExport.ts        CSV eksport
    stats.ts            Filtr, KPI hisob-kitoblari
    format.ts           Raqam/sana formatlash
```

## Texnik qarorlar

- **PDF uchun alohida grafik.** Ekrandan tashqarida light rangdagi, animatsiyasiz, 1000×440 px grafik render qilinadi —
  shu sababli PDF dark mode yoki ekran o'lchamidan qat'i nazar bir xil va tiniq chiqadi. Matn, KPI va jadval jsPDF bilan
  vektor ko'rinishda chiziladi (rasm emas), shuning uchun ular aniq va tanlanadigan.
- **Tailwind v3** tanlangan: html2canvas 1.x Tailwind v4 dagi `oklch()` ranglarni o'qiy olmaydi.
- **PDF'da kirill yozuvi:** jsPDF'ning standart Helvetica shrifti kirill harflarini qo'llamaydi, shuning uchun
  `dejavu-fonts-ttf` paketidagi DejaVu Sans ulanadi. Shriftlar faqat PDF yaratilganda bir marta yuklanadi.
- **Tarjima qilinadigan xatoliklar:** API client matn emas, xatolik turini (`network`, `timeout`, `server`, `invalid`)
  qaytaradi — UI uni joriy tilga o'giradi.
- **Code splitting:** html2canvas + jsPDF (~600 KB) faqat "PDF yuklab olish" bosilganda yuklanadi.

## Ma'lumotlar haqida

Qiymatlar O'zbekiston Respublikasi Statistika agentligi (stat.uz) ma'lumotlari asosida yil o'rtasidagi taxminiy,
yaxlitlangan ko'rsatkichlar; 2026-yil — prognoz. 2010–2011 yillardagi keskinroq o'sish rasmiy statistikadagi
qayta hisob-kitobni aks ettiradi.
