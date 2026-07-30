import type { Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";

/**
 * Same reasoning as the currency formatters: building an `Intl.DateTimeFormat`
 * costs far more than calling `.format` on one, and there are only two.
 */
const dateTimeFormatters = new Map<Locale, Intl.DateTimeFormat>();

const getDateTimeFormatter = (locale: Locale): Intl.DateTimeFormat => {
  let formatter = dateTimeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    dateTimeFormatters.set(locale, formatter);
  }
  return formatter;
};

/**
 * A date and time in the reader's language — `30/07/2026 15:24` in es-AR,
 * `07/30/2026, 03:24 PM` in en-US.
 *
 * The locale is passed in rather than left to `toLocaleDateString()`'s default,
 * which is the *runtime's* locale: on the server that is whatever Node was
 * started with, so the same instant used to render two different strings either
 * side of hydration.
 *
 * Returns `null` for anything that is not a real date, leaving it to the caller
 * to decide what an absent timestamp should look like.
 */
export const formatDate = (
  date: Date | null | undefined,
  locale: Locale
): string | null => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return getDateTimeFormatter(locale).format(date);
};

const dayFormatters = new Map<Locale, Intl.DateTimeFormat>();

/**
 * Render a `YYYY-MM-DD` value as a calendar day in the reader's convention —
 * `31/07/2026` or `07/31/2026`.
 *
 * `<input type="date">` speaks ISO and so do the rate APIs, but nobody wants to
 * read `2026-07-31` in a sentence. Falls back to the raw string if it is not a
 * date, which keeps a message that names it from going blank.
 */
export const formatYmd = (ymd: string, locale: Locale): string => {
  const date = parseYmdLocal(ymd);
  if (!date) return ymd;

  let formatter = dayFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dayFormatters.set(locale, formatter);
  }
  return formatter.format(date);
};

/**
 * Parse a `YYYY-MM-DD` date-input value as a *local* calendar day.
 *
 * `new Date("2025-08-01")` is specified to parse as UTC midnight, which in
 * Argentina (UTC-3) is 21:00 on 31 July — so the calendar day the user picked and
 * the one the app reports differ. Building from the parts sidesteps the timezone
 * round trip entirely. Noon keeps it clear of DST edges in either direction.
 */
export const parseYmdLocal = (ymd: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

  // Rejects impossible dates like 2025-02-30, which would otherwise roll over.
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return date;
};

/** Format a Date as `YYYY-MM-DD` using its *local* parts, for `<input type="date">`. */
export const toYmdLocal = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Parse a timestamp from an upstream API.
 *
 * dolarapi sends proper ISO 8601 with a zone. Some sources send
 * `"2025-01-13 19:04:00"` instead — a space separator and no zone, which JS
 * reads as *local* time and so lands hours off. Normalise to ISO, and assume
 * UTC only when no zone was given.
 */
export const parseApiTimestamp = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.trim() === "") return null;

  let text = value.trim().replace(" ", "T");
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(text);
  if (!hasZone) text += "Z";

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** The latest date with a published historical rate: yesterday, locally. */
export const getMaxHistoricalDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toYmdLocal(yesterday);
};

/**
 * Describe how long ago something happened, coarsely.
 *
 * `now` is a parameter rather than a `Date.now()` call so the caller owns the
 * clock — which is what keeps this pure and testable, and lets exactly one small
 * component subscribe to the ticking. The strings arrive the same way and for the
 * same reason: the buckets are the logic, the wording is the caller's language.
 *
 * `Intl.RelativeTimeFormat` would cover the numbered cases, but not "just now" or
 * "never", and it would leave the phrasing of two of the six buckets somewhere
 * other than the catalog. One source for all of them is worth more here than the
 * few lines it saves.
 */
export const describeAge = (
  lastUpdated: Date | null | undefined,
  now: number,
  age: Messages["age"]
): string => {
  if (!lastUpdated) return age.never;

  const diffMins = Math.floor((now - lastUpdated.getTime()) / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 1) return age.days(diffDays);
  if (diffDays === 1) return age.oneDay;
  if (diffHours > 1) return age.hours(diffHours);
  if (diffHours === 1) return age.oneHour;
  if (diffMins > 1) return age.minutes(diffMins);
  if (diffMins === 1) return age.oneMinute;
  return age.justNow;
};
