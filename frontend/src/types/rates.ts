/**
 * One internal spelling for each rate, plus explicit maps at every boundary.
 *
 * The codebase previously carried four spellings of two concepts — "blue"/"cripto"
 * in the selector, "crypto" in the display, "Blue"/"Crypto" in the Python backend —
 * and a stale-closure bug lived precisely on that seam. Note "cripto" is not ours
 * to rename: it is a path segment on the third-party argentinadatos API.
 */
export type RateType = "blue" | "crypto";

/** What the rate is called in the selection UI, including the manual option. */
export type SelectedRateType = RateType | "custom";

export const RATE_TYPES: RateType[] = ["blue", "crypto"];

/**
 * Path segment used by both upstream APIs — dolarapi for current quotes and
 * argentinadatos for historical ones. They independently happen to use the same
 * Spanish spelling; split this into two maps if either ever changes.
 */
export const RATE_SLUG: Record<RateType, string> = {
  blue: "blue",
  crypto: "cripto",
};

/** Endpoint on our own backend for the latest quote. */
export const BACKEND_PATH: Record<RateType, string> = {
  blue: "get_latest_blue",
  crypto: "get_latest_crypto",
};

export const RATE_LABEL: Record<RateType, string> = {
  blue: "Dólar Blue",
  crypto: "Dólar Cripto",
};

export const SELECTED_RATE_LABEL: Record<SelectedRateType, string> = {
  ...RATE_LABEL,
  custom: "Custom",
};

/** A quote for one rate at one moment. */
export interface RateSnapshot {
  buy: number;
  sell: number;
  avg: number;
  lastUpdated: Date | null;
}
