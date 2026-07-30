/**
 * The two upstream rate APIs, in one place.
 *
 * Server-side calls (`fetchCurrentRates`) go straight to the upstream, where the
 * Next data cache dedupes them. Browser-side calls go through this app's own route
 * handlers instead — not for CORS, which both APIs allow, but because a response
 * we serve is one whose cache headers we control, and because one shared cache
 * entry beats one upstream request per tab.
 *
 * Native `fetch` throughout — the app previously pulled in axios (18 kB gzipped)
 * for what amounts to three GETs with an AbortSignal.
 */

import {
  RATE_SLUG,
  RATE_TYPES,
  type RateSnapshot,
  type RateType,
} from "@/types/rates";
import { averageRate, toNumber } from "@/utils/rate";
import { parseApiTimestamp } from "@/utils/format_date";

const DOLARAPI_ORIGIN = "https://dolarapi.com";
/** Exported for the historical route handler, which builds the upstream URL. */
export const ARGENTINADATOS_ORIGIN = "https://api.argentinadatos.com";

const CURRENT_BASE_URL = `${DOLARAPI_ORIGIN}/v1/dolares`;

/**
 * How long a server-rendered quote may be reused. dolarapi refreshes a handful of
 * times a day, so five minutes is well inside the interval at which the number can
 * actually move, and collapses a burst of visitors into one upstream request.
 */
export const CURRENT_RATE_REVALIDATE_SECONDS = 300;

export type RateMap = Record<RateType, RateSnapshot | null>;

export const EMPTY_RATES: RateMap = { blue: null, crypto: null };

/** Shape a dolarapi quote into a snapshot, or null if the payload is unusable. */
export const toSnapshot = (data: unknown): RateSnapshot | null => {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;

  const buy = toNumber(record.compra);
  const sell = toNumber(record.venta);
  if (buy === null || sell === null) return null;

  return {
    buy,
    sell,
    avg: averageRate(buy, sell),
    lastUpdated: parseApiTimestamp(record.fechaActualizacion),
  };
};

/**
 * Fetch every current quote at once.
 *
 * One rate failing must not take the other down with it, so each request resolves
 * to its own null rather than rejecting the batch.
 */
export async function fetchCurrentRates(init?: RequestInit): Promise<RateMap> {
  const entries = await Promise.all(
    RATE_TYPES.map(async (rateType) => {
      try {
        const response = await fetch(
          `${CURRENT_BASE_URL}/${RATE_SLUG[rateType]}`,
          init
        );
        if (!response.ok) return [rateType, null] as const;
        return [rateType, toSnapshot(await response.json())] as const;
      } catch (err) {
        // An abort is the caller superseding itself, not a failure worth logging.
        if (!wasAborted(err, init)) {
          console.error(`Error fetching ${rateType} rate:`, err);
        }
        return [rateType, null] as const;
      }
    })
  );

  return Object.fromEntries(entries) as RateMap;
}

/**
 * Rebuild a `RateMap` from the proxy's JSON.
 *
 * `lastUpdated` leaves the server as a `Date` and arrives as an ISO string, so it
 * needs reviving. Everything is re-validated on the way in: this is parsing a
 * response, and the numbers reached us through two serialisation hops.
 */
const reviveRates = (data: unknown): RateMap => {
  if (typeof data !== "object" || data === null) return EMPTY_RATES;
  const record = data as Record<string, unknown>;

  const entries = RATE_TYPES.map((rateType) => {
    const raw = record[rateType];
    if (typeof raw !== "object" || raw === null) return [rateType, null] as const;

    const snapshot = raw as Record<string, unknown>;
    const buy = toNumber(snapshot.buy);
    const sell = toNumber(snapshot.sell);
    const avg = toNumber(snapshot.avg);
    if (buy === null || sell === null || avg === null) {
      return [rateType, null] as const;
    }

    return [
      rateType,
      { buy, sell, avg, lastUpdated: parseApiTimestamp(snapshot.lastUpdated) },
    ] as const;
  });

  return Object.fromEntries(entries) as RateMap;
};

/**
 * Current quotes for an open tab's periodic refresh. Browser-only: the URL is
 * same-origin and relative.
 *
 * Returns `EMPTY_RATES` for every failure mode, including abort. The caller treats
 * an all-null map as "nothing to apply" and keeps the quotes it already has, so a
 * failed refresh never blanks the display.
 */
export async function fetchCurrentRatesViaProxy(
  init?: RequestInit
): Promise<RateMap> {
  try {
    const response = await fetch("/api/current", init);
    if (!response.ok) return EMPTY_RATES;
    return reviveRates(await response.json());
  } catch (err) {
    if (!wasAborted(err, init)) {
      console.error("Error refreshing current rates:", err);
    }
    return EMPTY_RATES;
  }
}

/**
 * A historical quote, keyed by rate type and calendar day.
 *
 * The innermost of four caches, and the only one that costs no request at all:
 * a repeat within the tab never leaves memory. Behind it sit the browser's HTTP
 * cache, the CDN and the Next data cache — see the route handler at
 * `app/api/historical/[rateType]/[ymd]` for why the trip is proxied rather than
 * made against argentinadatos directly.
 *
 * Only successful lookups are stored: a day with no rate yet may well get one
 * later, and caching that "no" would pin it for the session.
 */
const historicalCache = new Map<string, number>();

export type HistoricalResult =
  | { status: "ok"; value: number }
  | { status: "missing" }
  | { status: "failed" }
  | { status: "aborted" };

/** Browser-only: the URL is same-origin and relative. */
export async function fetchHistoricalRate(
  rateType: RateType,
  ymd: string,
  init?: RequestInit
): Promise<HistoricalResult> {
  const key = `${rateType}:${ymd}`;
  const cached = historicalCache.get(key);
  if (cached !== undefined) return { status: "ok", value: cached };

  try {
    const response = await fetch(`/api/historical/${rateType}/${ymd}`, init);

    if (!response.ok) {
      return response.status === 404
        ? { status: "missing" }
        : { status: "failed" };
    }

    const value = toNumber((await response.json())?.value);
    if (value === null) return { status: "missing" };

    historicalCache.set(key, value);
    return { status: "ok", value };
  } catch (err) {
    if (wasAborted(err, init)) return { status: "aborted" };
    console.error("Error fetching historical rate:", err);
    return { status: "failed" };
  }
}

/**
 * Did this request fail because we superseded it, rather than for a real reason?
 *
 * The signal is checked as well as the error name, and that is the load-bearing
 * half: an abort that lands before the connection is established surfaces in
 * Chrome as `TypeError: Failed to fetch`, not as an `AbortError`. Going by name
 * alone, the date picker — which aborts a request per segment the user edits —
 * reports its own cancellations to the user as failures.
 */
function wasAborted(err: unknown, init?: RequestInit): boolean {
  if (init?.signal?.aborted) return true;
  return err instanceof Error && err.name === "AbortError";
}
