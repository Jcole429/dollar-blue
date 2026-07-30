"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";
import {
  RATE_SLUG,
  RATE_TYPES,
  type RateSnapshot,
  type RateType,
} from "@/types/rates";
import { averageRate, toNumber } from "@/utils/rate";
import { parseApiTimestamp } from "@/utils/format_date";

/**
 * Current quotes come straight from dolarapi in the browser, the same way
 * historical quotes come straight from argentinadatos. dolarapi sends
 * `Access-Control-Allow-Origin: *`, so no proxy is needed.
 */
const DOLARAPI_BASE_URL = "https://dolarapi.com/v1/dolares";

/** How often the "x minutes ago" labels are recomputed. */
const TICK_MS = 60_000;

interface CurrentExchangeRateContextProps {
  rates: Record<RateType, RateSnapshot | null>;
  loading: boolean;
  error: string | null;
  timeSinceUpdate: (rateType: RateType) => string;
}

export const CurrentExchangeRateContext = createContext<
  CurrentExchangeRateContextProps | undefined
>(undefined);

const describeAge = (lastUpdated: Date | null, now: number): string => {
  if (!lastUpdated) return "Never updated";

  const diffMins = Math.floor((now - lastUpdated.getTime()) / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 1) return `${diffDays} days ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffHours > 1) return `${diffHours} hours ago`;
  if (diffHours === 1) return "1 hour ago";
  if (diffMins > 1) return `${diffMins} minutes ago`;
  if (diffMins === 1) return "1 minute ago";
  return "just now";
};

/** Shape a dolarapi quote into a snapshot, or null if the payload is unusable. */
const toSnapshot = (data: unknown): RateSnapshot | null => {
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

export const CurrentExchangeRateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rates, setRates] = useState<Record<RateType, RateSnapshot | null>>({
    blue: null,
    crypto: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      const results = await Promise.all(
        RATE_TYPES.map(async (rateType) => {
          try {
            const response = await axios.get(
              `${DOLARAPI_BASE_URL}/${RATE_SLUG[rateType]}`,
              { signal: controller.signal }
            );
            return [rateType, toSnapshot(response.data)] as const;
          } catch (err) {
            if (!axios.isCancel(err)) {
              console.error(`Error fetching ${rateType} rate:`, err);
            }
            return [rateType, null] as const;
          }
        })
      );

      if (controller.signal.aborted) return;

      const next = Object.fromEntries(results) as Record<
        RateType,
        RateSnapshot | null
      >;
      setRates(next);
      setLoading(false);
      setError(
        RATE_TYPES.every((rateType) => next[rateType] === null)
          ? "Could not load exchange rates. Please try again later."
          : null
      );
    };

    load();
    return () => controller.abort();
  }, []);

  // Keeps the "x minutes ago" labels honest; they used to be computed once and
  // then stay frozen for the life of the tab.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <CurrentExchangeRateContext.Provider
      value={{
        rates,
        loading,
        error,
        timeSinceUpdate: (rateType) =>
          describeAge(rates[rateType]?.lastUpdated ?? null, now),
      }}
    >
      {children}
    </CurrentExchangeRateContext.Provider>
  );
};

export const useCurrentExchangeRateContext = () => {
  const context = useContext(CurrentExchangeRateContext);
  if (!context) {
    throw new Error(
      "useCurrentExchangeRateContext must be used within a CurrentExchangeRateProvider"
    );
  }
  return context;
};
