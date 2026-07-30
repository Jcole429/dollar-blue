"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { RATE_SLUG, type RateType } from "@/types/rates";
import { averageRate, toNumber } from "@/utils/rate";

const BASE_URL = "https://api.argentinadatos.com/v1/cotizaciones/dolares";

/**
 * Fetch a historical average rate for one day.
 *
 * `<input type="date">` fires a change per segment edit, so requests pile up as
 * the user tabs through day/month/year. Without cancellation a stale response can
 * land last and win, leaving a rate for a date the user only passed through.
 */
export function useHistoricalRate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const fetchRate = useCallback(
    async (rateType: RateType, ymd: string): Promise<number | null> => {
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setLoading(true);
      setError(null);

      const [year, month, day] = ymd.split("-");

      try {
        const response = await axios.get(
          `${BASE_URL}/${RATE_SLUG[rateType]}/${year}/${month}/${day}`,
          { signal: controller.signal }
        );

        const buy = toNumber(response.data?.compra);
        const sell = toNumber(response.data?.venta);

        if (buy === null || sell === null) {
          setError(`No rate published for ${ymd}.`);
          return null;
        }

        return averageRate(buy, sell);
      } catch (err) {
        // A cancelled request is this hook superseding itself, not a failure.
        if (axios.isCancel(err) || controller.signal.aborted) return null;
        console.error("Error fetching historical rate:", err);
        setError("Failed to fetch historical rate. Please try again.");
        return null;
      } finally {
        // Only the newest request owns the flag; an aborted one must not clear it.
        if (inFlight.current === controller) {
          inFlight.current = null;
          setLoading(false);
        }
      }
    },
    []
  );

  return { fetchRate, loading, error, clearError: () => setError(null) };
}
