/**
 * Guards and arithmetic for exchange-rate values.
 *
 * Rates come from third-party APIs as untyped JSON, so `toNumber` is applied at
 * every fetch boundary before anything inspects or divides by the value.
 */

/** Coerce an untrusted API value to a number, or `null` if it isn't one. */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed === "") return null; // guard the `Number("") === 0` trap

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * A rate is usable only if we can divide by it. A custom rate of 0 used to slip
 * through `isNaN(0) === false` and render "$∞".
 */
export function isUsableRate(rate: unknown): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
}

/** The mid-market rate, rounded to the 2 decimals every source quotes in. */
export function averageRate(buy: number, sell: number): number {
  return Math.round(((buy + sell) / 2) * 100) / 100;
}
