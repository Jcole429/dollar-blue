import { describe, expect, it } from "vitest";
import {
  matchAcceptLanguage,
  parseAcceptLanguage,
  resolveLocaleSegment,
} from "./negotiate_locale";
import { DEFAULT_LOCALE_SEGMENT, LOCALE_SEGMENTS } from "./locales";

describe("matchAcceptLanguage", () => {
  it.each([
    ["nothing at all", null, null],
    ["undefined", undefined, null],
    ["an empty header", "", null],
    ["a blank header", "   ", null],
    ["the exact Argentine tag", "es-AR", "es"],
    ["the exact American tag", "en-US", "en"],
    ["a language with no region", "en", "en"],
    ["a region we do not have", "en-GB", "en"],
    ["a different case", "EN-gb", "en"],
    ["another Spanish region", "es-ES", "es"],
    ["a language we do not speak", "fr-FR", null],
    ["a three-subtag tag", "zh-Hant-TW", null],
    ["a script subtag we do speak", "es-Latn-AR", "es"],
  ])("matches %s", (_name, header, expected) => {
    expect(matchAcceptLanguage(header)).toBe(expected);
  });

  it("takes the first supported range, not the first listed", () => {
    expect(matchAcceptLanguage("fr-FR,en;q=0.8")).toBe("en");
  });

  it("prefers the heavier range over the earlier one", () => {
    expect(matchAcceptLanguage("en;q=0.8,es;q=0.9")).toBe("es");
  });

  // Stability is what the RFC's tie-break relies on; without it this is a coin
  // flip that happens to land the same way most of the time.
  it("falls back to document order when the weights tie", () => {
    expect(matchAcceptLanguage("en;q=0.8,es;q=0.8")).toBe("en");
    expect(matchAcceptLanguage("es;q=0.8,en;q=0.8")).toBe("es");
  });

  it.each([
    ["a bare wildcard", "*"],
    ["a wildcard behind a language we lack", "fr,*;q=0.5"],
  ])("sends %s to the default", (_name, header) => {
    expect(matchAcceptLanguage(header)).toBe(DEFAULT_LOCALE_SEGMENT);
  });

  it("honours q=0 as a refusal", () => {
    expect(matchAcceptLanguage("en;q=0")).toBeNull();
    expect(matchAcceptLanguage("en;q=0,es")).toBe("es");
  });

  it("reads through whitespace around the tags", () => {
    expect(matchAcceptLanguage("  en-US , fr ")).toBe("en");
  });

  // Discriminating on purpose: if the `q` either side of the `=` were not
  // trimmed, both ranges would keep their default weight of 1 and the stable
  // sort would hand this to `es`.
  it("reads through whitespace around the weight", () => {
    expect(matchAcceptLanguage("  es ; q = 0.1 , en-US ; q = 0.9 ")).toBe("en");
  });

  it.each([
    ["an unreadable weight", "en;q=abc", "en"],
    ["a weight above one", "en;q=5", "en"],
    ["a parameter that is not a weight", "en;charset=utf-8", "en"],
  ])("forgives %s", (_name, header, expected) => {
    expect(matchAcceptLanguage(header)).toBe(expected);
  });

  it("clamps a negative weight to a refusal", () => {
    expect(matchAcceptLanguage("en;q=-1")).toBeNull();
  });

  it.each([
    ["only separators", ",,;;,"],
    ["a trailing semicolon", "en;"],
    ["a parameter with no tag", ";q=0.5"],
    ["an equals with no name", "=;q"],
    ["a lone comma", ","],
  ])("does not throw on %s", (_name, header) => {
    expect(() => matchAcceptLanguage(header)).not.toThrow();
  });

  it("stops reading a header no browser would send", () => {
    expect(matchAcceptLanguage("en,".repeat(400))).toBeNull();
  });

  it("is unbothered by duplicates", () => {
    expect(matchAcceptLanguage("en-US,en-US,en")).toBe("en");
  });
});

describe("parseAcceptLanguage", () => {
  it("lowercases the tags it returns", () => {
    expect(parseAcceptLanguage("EN-GB")).toEqual([{ tag: "en-gb", q: 1 }]);
  });

  it("defaults a weightless range to 1", () => {
    expect(parseAcceptLanguage("es,en;q=0.5")).toEqual([
      { tag: "es", q: 1 },
      { tag: "en", q: 0.5 },
    ]);
  });
});

describe("resolveLocaleSegment", () => {
  it("lets an explicit choice outrank the browser", () => {
    expect(resolveLocaleSegment("en", "es-AR,es;q=0.9")).toBe("en");
    expect(resolveLocaleSegment("es", "en-US,en;q=0.9")).toBe("es");
  });

  it.each([
    ["a value that is not a language", "xx"],
    ["the full tag", "es-AR"],
    ["an empty cookie", ""],
  ])("ignores %s in the cookie and negotiates instead", (_name, cookie) => {
    expect(resolveLocaleSegment(cookie, "en-US")).toBe("en");
  });

  it.each([
    ["no cookie and a language we lack", undefined, "fr", "es"],
    ["no cookie and no header", undefined, null, "es"],
    ["no cookie and a blank header", undefined, "", "es"],
  ])("falls back for %s", (_name, cookie, header, expected) => {
    expect(resolveLocaleSegment(cookie, header)).toBe(expected);
  });

  // So adding a third language cannot quietly leave the cookie path behind.
  it.each(LOCALE_SEGMENTS)("honours a %s cookie", (segment) => {
    expect(resolveLocaleSegment(segment, "fr")).toBe(segment);
  });
});
