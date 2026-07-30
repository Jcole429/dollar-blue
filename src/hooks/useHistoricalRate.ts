"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RateType } from "@/types/rates";
import { fetchHistoricalRate } from "@/lib/rates_api";

/**
 * Fetch a historical average rate for one day.
 *
 * `<input type="date">` fires a change per segment edit, so requests pile up as
 * the user tabs through day/month/year. Without cancellation a stale response can
 * land last and win, leaving a rate for a date the user only passed through.
 *
 * Repeat lookups never reach the network: `fetchHistoricalRate` memoises
 * published rates, which are immutable once published.
 */
export function useHistoricalRate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  /**
   * Resolves to the rate, to `null` when that day has no published rate, and to
   * `undefined` when this request was superseded by a newer one.
   *
   * The caller must apply the first two and ignore the third. Collapsing the
   * last two into one `null` let a cancelled lookup — which resolves as soon as
   * it is aborted, and so can land after the request that replaced it — write
   * its empty answer over a newer, correct selection.
   */
  const fetchRate = useCallback(
    async (
      rateType: RateType,
      ymd: string
    ): Promise<number | null | undefined> => {
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setLoading(true);
      setError(null);

      const result = await fetchHistoricalRate(rateType, ymd, {
        signal: controller.signal,
      });

      // Only the newest request may report anything at all. A superseded one is
      // answering about a date the user has already moved past, so it must touch
      // neither the loading flag nor the error — its rejection is our own doing.
      if (inFlight.current !== controller) return undefined;

      inFlight.current = null;
      setLoading(false);

      switch (result.status) {
        case "ok":
          return result.value;
        case "missing":
          setError(`No rate published for ${ymd}.`);
          return null;
        case "failed":
          setError("Failed to fetch historical rate. Please try again.");
          return null;
        case "aborted":
          // This hook superseding itself, not a failure and not an answer.
          return undefined;
      }
    },
    []
  );

  return useMemo(
    () => ({ fetchRate, loading, error }),
    [fetchRate, loading, error]
  );
}
