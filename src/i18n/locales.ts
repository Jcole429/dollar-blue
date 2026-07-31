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

/**
 * What each language is called in a URL.
 *
 * Short, because a path segment is something people read and type: `/es`, not
 * `/es-AR`. The full tag stays the internal type — it is what `Intl` and
 * `<html lang>` need — so the two vocabularies are mapped rather than merged.
 */
export type LocaleSegment = "es" | "en";

export const LOCALE_SEGMENTS: LocaleSegment[] = ["es", "en"];

export const SEGMENT_TO_LOCALE: Record<LocaleSegment, Locale> = {
  es: "es-AR",
  en: "en-US",
};

export const LOCALE_TO_SEGMENT: Record<Locale, LocaleSegment> = {
  "es-AR": "es",
  "en-US": "en",
};

/** Derived rather than written out, so the two can never drift apart. */
export const DEFAULT_LOCALE_SEGMENT: LocaleSegment =
  LOCALE_TO_SEGMENT[DEFAULT_LOCALE];

export const isLocaleSegment = (value: unknown): value is LocaleSegment =>
  typeof value === "string" && (LOCALE_SEGMENTS as string[]).includes(value);

/**
 * Where an explicit language choice is remembered.
 *
 * Only ever written by the language picker, and that is the whole point: it
 * means "someone chose this", never "we guessed this". A negotiated language
 * that wrote itself here would outrank the browser setting it was guessed from,
 * so changing that setting later would stop having any effect.
 */
export const LOCALE_COOKIE = "dollar-blue.locale";
