"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import { RATE_TYPES } from "@/types/rates";
import { fetchCurrentRatesViaProxy, type RateMap } from "@/lib/rates_api";

/**
 * How often an open tab re-checks for a newer quote.
 *
 * The first render is seeded from the server, so this is purely about a tab left
 * open — not the load path. The request goes to this app's `/api/current`, which
 * is cached for the same five minutes, so N open tabs still cost one upstream
 * request per window rather than N.
 */
const REFRESH_MS = 5 * 60_000;

interface CurrentExchangeRateContextProps {
  rates: RateMap;
  error: string | null;
}

export const CurrentExchangeRateContext = createContext<
  CurrentExchangeRateContextProps | undefined
>(undefined);

const bothMissing = (rates: RateMap) =>
  RATE_TYPES.every((rateType) => rates[rateType] === null);

const LOAD_ERROR = "Could not load exchange rates. Please try again later.";

export const CurrentExchangeRateProvider: React.FC<{
  /** Quotes fetched during the server render, so the first paint already has them. */
  initialRates: RateMap;
  children: ReactNode;
}> = ({ initialRates, children }) => {
  const [rates, setRates] = useState<RateMap>(initialRates);

  useEffect(() => {
    const controller = new AbortController();

    const refresh = async () => {
      const next = await fetchCurrentRatesViaProxy({
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      // A failed refresh must not blank out quotes that are merely a bit old.
      if (bothMissing(next)) return;
      // Per rate, not wholesale: one quote failing upstream still returns 200
      // with that entry null, and replacing the map outright would drop a good
      // snapshot for the rate that did not fail.
      setRates((current) =>
        Object.fromEntries(
          RATE_TYPES.map((rateType) => [
            rateType,
            next[rateType] ?? current[rateType],
          ])
        ) as RateMap
      );
    };

    const id = setInterval(refresh, REFRESH_MS);
    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, []);

  const value = useMemo(
    () => ({ rates, error: bothMissing(rates) ? LOAD_ERROR : null }),
    [rates]
  );

  return (
    <CurrentExchangeRateContext.Provider value={value}>
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
