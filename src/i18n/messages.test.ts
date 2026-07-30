import { describe, expect, it } from "vitest";
import { MESSAGES } from "./messages";
import { LOCALES, LOCALE_NATIVE_NAME, isLocale } from "./locales";

type Entry = { path: string; value: unknown };

/** Flatten a catalog to `path -> value` so two of them can be compared key by key. */
const walk = (node: unknown, prefix = ""): Entry[] => {
  if (typeof node !== "object" || node === null) {
    return [{ path: prefix, value: node }];
  }
  return Object.entries(node).flatMap(([key, value]) =>
    walk(value, prefix === "" ? key : `${prefix}.${key}`)
  );
};

const catalogs = LOCALES.map((locale) => ({
  locale,
  entries: walk(MESSAGES[locale]),
}));

describe("message catalogs", () => {
  it("covers every locale", () => {
    for (const locale of LOCALES) {
      expect(MESSAGES[locale]).toBeDefined();
      expect(isLocale(locale)).toBe(true);
      expect(LOCALE_NATIVE_NAME[locale]).toBeTruthy();
    }
  });

  it.each(catalogs.map((c) => c.locale))(
    "%s has exactly the same keys as every other language",
    (locale) => {
      const keys = walk(MESSAGES[locale])
        .map((entry) => entry.path)
        .sort();

      for (const other of LOCALES) {
        const otherKeys = walk(MESSAGES[other])
          .map((entry) => entry.path)
          .sort();
        expect(keys).toEqual(otherKeys);
      }
    }
  );

  it.each(catalogs.map((c) => c.locale))(
    "%s has no blank message",
    (locale) => {
      for (const { path, value } of walk(MESSAGES[locale])) {
        if (typeof value === "string") {
          expect(value.trim(), `${locale} ${path} is blank`).not.toBe("");
        }
      }
    }
  );

  it.each(catalogs.map((c) => c.locale))(
    "%s renders every argument it is given",
    (locale) => {
      for (const { path, value } of walk(MESSAGES[locale])) {
        if (typeof value !== "function") continue;

        // A translation that quietly drops an interpolated value is the one
        // failure a type checker cannot see: the signature still matches, and
        // the sentence just comes out missing the date or the amount.
        const args = Array.from(
          { length: value.length },
          (_, index) => 90001 + index
        );
        const rendered = String(value(...args));

        for (const arg of args) {
          expect(rendered, `${locale} ${path} drops ${arg}`).toContain(
            String(arg)
          );
        }
      }
    }
  );

  it("has a message of the same kind at every path", () => {
    // A string in one language where another has a function means one of them
    // stopped interpolating.
    const [first, ...rest] = catalogs;
    for (const other of rest) {
      for (const entry of first.entries) {
        const match = other.entries.find((e) => e.path === entry.path)!;
        expect(typeof match.value, entry.path).toBe(typeof entry.value);
        if (typeof entry.value === "function") {
          expect(
            (match.value as Function).length,
            `${entry.path} arity`
          ).toBe(entry.value.length);
        }
      }
    }
  });
});
