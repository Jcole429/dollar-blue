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
  BACKEND_PATH,
  RATE_TYPES,
  type RateSnapshot,
  type RateType,
} from "@/types/rates";
import { toNumber } from "@/utils/rate";
import { parseApiTimestamp } from "@/utils/format_date";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://dollar-blue-backend.vercel.app";

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

/** The backend serialises Decimals with `str()`, so every field arrives as text. */
const toSnapshot = (data: unknown): RateSnapshot | null => {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;

  const buy = toNumber(record.buy);
  const sell = toNumber(record.sell);
  const avg = toNumber(record.avg);
  if (buy === null || sell === null || avg === null) return null;

  return {
    buy,
    sell,
    avg,
    lastUpdated: parseApiTimestamp(record.updated_date),
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
              `${API_BASE_URL}/api/${BACKEND_PATH[rateType]}`,
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
