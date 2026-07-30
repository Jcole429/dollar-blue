export const formatDate = (date: Date | null | undefined) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "Invalid date";
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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
