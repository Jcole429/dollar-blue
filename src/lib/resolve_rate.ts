import type { RateMap } from "./rates_api";
import type { RateType, SelectedRateType } from "@/types/rates";

/**
 * An explicit choice the user has made in the rate selector.
 *
 * `current` stores the *intent* and nothing else, because a quote is not a value
 * the selector can hold: the provider refreshes its rates every five minutes, and
 * a choice that captured a number at click time went on calling it "current" long
 * after it stopped being so. Historical and custom are `fixed` — for those the
 * answer really is settled at the moment it is made.
 */
export type RateSelection =
  | { source: "current"; type: RateType }
  | {
      source: "fixed";
      type: SelectedRateType;
      value: number | null;
      updatedDate: Date | null;
    };

export interface ResolvedRate {
  type: SelectedRateType;
  value: number | null;
  updatedDate: Date | null;
}

/**
 * Turn a selection into the numbers on screen, against the quotes as they stand
 * *this* render. No choice yet and an explicit "current" resolve the same way —
 * the difference between them is which rate is read, not whether it is live.
 */
export const resolveRate = (
  selection: RateSelection | null,
  rates: RateMap
): ResolvedRate => {
  if (selection !== null && selection.source === "fixed") return selection;

  const type = selection?.type ?? "blue";
  const snapshot = rates[type];
  return {
    type,
    value: snapshot?.avg ?? null,
    updatedDate: snapshot?.lastUpdated ?? null,
  };
};
