import { describe, expect, it } from "vitest";
import { resolveRate, type RateSelection } from "./resolve_rate";
import type { RateMap } from "./rates_api";

/**
 * The distinction these cover is the one the type encodes: a `current` selection
 * names a rate and nothing else, so it has to be answered from whatever quotes
 * are in hand *now*, while a `fixed` one carries its own answer and must not
 * move when newer quotes arrive.
 */

const QUOTED_AT = new Date("2026-07-30T20:56:00Z");
const REFRESHED_AT = new Date("2026-07-30T23:55:00Z");

const RATES: RateMap = {
  blue: { buy: 1545, sell: 1565, avg: 1555, lastUpdated: QUOTED_AT },
  crypto: { buy: 1567.49, sell: 1569.85, avg: 1568.67, lastUpdated: QUOTED_AT },
};

/** The same map after the provider's five-minute refresh has moved blue. */
const REFRESHED: RateMap = {
  blue: { buy: 1990, sell: 2010, avg: 2000, lastUpdated: REFRESHED_AT },
  crypto: RATES.crypto,
};

describe("resolveRate", () => {
  it("falls back to the live blue average before any choice is made", () => {
    expect(resolveRate(null, RATES)).toEqual({
      type: "blue",
      value: 1555,
      updatedDate: QUOTED_AT,
    });
  });

  it("keeps the fallback live once newer quotes arrive", () => {
    expect(resolveRate(null, REFRESHED).value).toBe(2000);
  });

  it("still reports blue when no blue quote could be had", () => {
    expect(resolveRate(null, { blue: null, crypto: RATES.crypto })).toEqual({
      type: "blue",
      value: null,
      updatedDate: null,
    });
  });

  it("re-reads a current selection from the latest quotes", () => {
    // The regression this exists for. The selection is one object, resolved
    // twice: a rate chosen as "current" used to capture its number at click
    // time and go on calling that number current for as long as the tab was
    // open, while the display panels beside it showed the new one.
    const selection: RateSelection = { source: "current", type: "blue" };

    expect(resolveRate(selection, RATES).value).toBe(1555);
    expect(resolveRate(selection, REFRESHED)).toEqual({
      type: "blue",
      value: 2000,
      updatedDate: REFRESHED_AT,
    });
  });

  it("follows the rate a current selection names", () => {
    const selection: RateSelection = { source: "current", type: "crypto" };

    expect(resolveRate(selection, RATES).value).toBe(1568.67);
    // Blue moved and crypto did not, so a crypto selection must not budge.
    expect(resolveRate(selection, REFRESHED).value).toBe(1568.67);
  });

  it("reports no value when the rate a current selection names is missing", () => {
    const selection: RateSelection = { source: "current", type: "crypto" };

    expect(resolveRate(selection, { blue: RATES.blue, crypto: null })).toEqual({
      type: "crypto",
      value: null,
      updatedDate: null,
    });
  });

  it("leaves a historical selection alone when the quotes move", () => {
    // The other half of the distinction: a published rate for a past day is an
    // answer, not a subscription. Re-reading it against newer quotes would
    // quietly replace the day the user asked for with today.
    const asked = new Date("2026-07-28T12:00:00Z");
    const selection: RateSelection = {
      source: "fixed",
      type: "blue",
      value: 1560,
      updatedDate: asked,
    };

    // The three fields rather than the whole object: whether the resolver hands
    // the selection straight back or builds a fresh answer is its own business.
    for (const rates of [RATES, REFRESHED]) {
      expect(resolveRate(selection, rates)).toMatchObject({
        type: "blue",
        value: 1560,
        updatedDate: asked,
      });
    }
  });

  it("passes a custom rate through untouched", () => {
    const selection: RateSelection = {
      source: "fixed",
      type: "custom",
      value: 1700,
      updatedDate: QUOTED_AT,
    };

    expect(resolveRate(selection, REFRESHED)).toMatchObject({
      type: "custom",
      value: 1700,
      updatedDate: QUOTED_AT,
    });
  });

  it("keeps a choice that resolved to nothing distinct from no choice", () => {
    // An emptied date is an explicit selection with no value, and it has to stay
    // that way — falling back to blue here is what would silently compute with a
    // rate the user did not pick.
    const selection: RateSelection = {
      source: "fixed",
      type: "blue",
      value: null,
      updatedDate: null,
    };

    expect(resolveRate(selection, RATES).value).toBeNull();
  });
});
