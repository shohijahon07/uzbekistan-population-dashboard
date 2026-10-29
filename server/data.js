/**
 * O'zbekiston aholisi (yil o'rtasidagi taxminiy qiymatlar, yaxlitlangan).
 * Manba: O'zbekiston Respublikasi Prezidenti huzuridagi Statistika agentligi (stat.uz)
 * ma'lumotlari asosida. 2026-yil — prognoz qiymat.
 */
export const populationSeries = [
  { year: 1991, population: 20800000 },
  { year: 1992, population: 21350000 },
  { year: 1993, population: 21850000 },
  { year: 1994, population: 22280000 },
  { year: 1995, population: 22685000 },
  { year: 1996, population: 23130000 },
  { year: 1997, population: 23560000 },
  { year: 1998, population: 23955000 },
  { year: 1999, population: 24310000 },
  { year: 2000, population: 24650000 },
  { year: 2001, population: 24965000 },
  { year: 2002, population: 25270000 },
  { year: 2003, population: 25568000 },
  { year: 2004, population: 25865000 },
  { year: 2005, population: 26167000 },
  { year: 2006, population: 26488000 },
  { year: 2007, population: 26868000 },
  { year: 2008, population: 27303000 },
  { year: 2009, population: 27767000 },
  { year: 2010, population: 28562000 },
  { year: 2011, population: 29339000 },
  { year: 2012, population: 29774000 },
  { year: 2013, population: 30243000 },
  { year: 2014, population: 30758000 },
  { year: 2015, population: 31299000 },
  { year: 2016, population: 31848000 },
  { year: 2017, population: 32389000 },
  { year: 2018, population: 32956000 },
  { year: 2019, population: 33580000 },
  { year: 2020, population: 34232000 },
  { year: 2021, population: 34915000 },
  { year: 2022, population: 35648000 },
  { year: 2023, population: 36412000 },
  { year: 2024, population: 37171000 },
  { year: 2025, population: 37921000 },
  { year: 2026, population: 38660000 },
];

export const MIN_YEAR = populationSeries[0].year;
export const MAX_YEAR = populationSeries[populationSeries.length - 1].year;
