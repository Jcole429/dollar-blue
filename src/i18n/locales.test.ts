import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  DEFAULT_LOCALE_SEGMENT,
  LOCALES,
  LOCALE_SEGMENTS,
  LOCALE_TO_SEGMENT,
  SEGMENT_TO_LOCALE,
  isLocaleSegment,
} from "./locales";

describe("locale segments", () => {
  it("names every locale", () => {
    expect(LOCALE_SEGMENTS).toHaveLength(LOCALES.length);
    expect(Object.keys(SEGMENT_TO_LOCALE)).toHaveLength(LOCALES.length);
    expect(Object.keys(LOCALE_TO_SEGMENT)).toHaveLength(LOCALES.length);
  });

  // The two tables are written by hand, so this is the check that a third
  // language cannot be half-added.
  it.each(LOCALES)("round-trips %s through its segment", (locale) => {
    expect(SEGMENT_TO_LOCALE[LOCALE_TO_SEGMENT[locale]]).toBe(locale);
  });

  it.each(LOCALE_SEGMENTS)("round-trips /%s through its locale", (segment) => {
    expect(LOCALE_TO_SEGMENT[SEGMENT_TO_LOCALE[segment]]).toBe(segment);
  });

  it("gives every segment a distinct locale", () => {
    expect(new Set(Object.values(SEGMENT_TO_LOCALE)).size).toBe(LOCALES.length);
  });

  it("defaults to the segment of the default locale", () => {
    expect(SEGMENT_TO_LOCALE[DEFAULT_LOCALE_SEGMENT]).toBe(DEFAULT_LOCALE);
  });
});

describe("isLocaleSegment", () => {
  it.each(LOCALE_SEGMENTS)("accepts %s", (segment) => {
    expect(isLocaleSegment(segment)).toBe(true);
  });

  // "es-AR" is the one wrong answer worth naming: it is a perfectly valid
  // locale, just not a URL, and a cookie or a path holding it must not be
  // trusted on the strength of looking familiar.
  it.each([
    ["the full tag", "es-AR"],
    ["the other full tag", "en-US"],
    ["a different case", "EN"],
    ["a near miss", "esp"],
    ["a prefix match", "espanol"],
    ["the empty string", ""],
    ["null", null],
    ["undefined", undefined],
    ["a number", 0],
    ["an object", { es: true }],
  ])("rejects %s", (_name, value) => {
    expect(isLocaleSegment(value)).toBe(false);
  });
});
