import type { ApiErrorKind, PopulationResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const REQUEST_TIMEOUT_MS = 15_000;

/** Xabar matni UI tomonida tanlangan tilga tarjima qilinadi, shuning uchun bu yerda faqat tur (kind) saqlanadi. */
export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
  ) {
    super(`API error: ${kind}${status ? ` (HTTP ${status})` : ''}`);
    this.name = 'ApiError';
  }
}

function isPopulationResponse(value: unknown): value is PopulationResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.country === 'string' &&
    typeof v.unit === 'string' &&
    Array.isArray(v.data) &&
    v.data.every(
      (p) =>
        p &&
        typeof (p as Record<string, unknown>).year === 'number' &&
        typeof (p as Record<string, unknown>).population === 'number',
    )
  );
}

/**
 * Demo uchun: sahifa URL'idagi ?delay=3000 yoki ?simulateError=1 parametrlari
 * API'ga uzatiladi — loading va error holatlarini qo'lda tekshirish mumkin.
 */
function buildDebugQuery(): string {
  const page = new URLSearchParams(window.location.search);
  const query = new URLSearchParams();
  const delay = page.get('delay');
  if (delay) query.set('delay', delay);
  if (page.has('simulateError')) query.set('fail', 'true');
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchPopulation(signal?: AbortSignal): Promise<PopulationResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const response = await fetch(`${API_BASE_URL}/api/population${buildDebugQuery()}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) throw new ApiError('server', response.status);

    const body: unknown = await response.json().catch(() => null);
    if (!isPopulationResponse(body)) throw new ApiError('invalid');

    return { ...body, data: [...body.data].sort((a, b) => a.year - b.year) };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (signal?.aborted) throw err;
    if (controller.signal.aborted) throw new ApiError('timeout');
    throw new ApiError('network');
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}
