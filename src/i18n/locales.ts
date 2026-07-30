/**
 * The two languages the UI speaks.
 *
 * These are BCP 47 tags rather than bare language codes on purpose: they are fed
 * straight to `Intl` and to `<html lang>`, and the region is what decides whether
 * a date reads `30/07/2026` or `07/30/2026`.
 */
export type Locale = "es-AR" | "en-US";

/**
 * Argentine Spanish, because the site is about the Argentine peso and is read
 * overwhelmingly from Argentina. It is also the locale the server renders in —
 * see LocaleProvider for why that matters.
 */
export const DEFAULT_LOCALE: Locale = "es-AR";

export const LOCALES: Locale[] = ["es-AR", "en-US"];

/**
 * How each language names itself.
 *
 * Deliberately *not* translated: a language picker that renders every option in
 * the language you are trying to leave is unusable to the person who most needs
 * it. "English (US)" stays "English (US)" while the UI is in Spanish.
 */
export const LOCALE_NATIVE_NAME: Record<Locale, string> = {
  "es-AR": "Español (AR)",
  "en-US": "English (US)",
};

/** ISO 3166-1 alpha-2 country whose flag stands for each locale. */
export const LOCALE_COUNTRY: Record<Locale, "AR" | "US"> = {
  "es-AR": "AR",
  "en-US": "US",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as string[]).includes(value);
