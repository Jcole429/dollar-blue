/**
 * Locale-agnostic money parser.
 *
 * The app displays ARS in es-AR (`$ 1.234,56`) and USD in en-US (`US$ 1,234.56`),
 * and users habitually type either convention. Rather than pick one and reject the
 * other, this parser accepts both and disambiguates from the shape of the input.
 *
 * Deliberately does NOT use `Intl`: deriving separators from a locale is exactly
 * what would re-lock parsing to a single convention. `.` and `,` are hardcoded.
 */

/** Currency symbols and the space characters `Intl` emits (space, NBSP, narrow NBSP). */
const NOISE = /US\$|[$'   ]/g;

/** Values are rounded to 2 decimals — the whole domain is 2dp (Numeric(16,2) in the DB). */
const DECIMAL_PLACES = 2;

/**
 * Parse a user-typed amount into a number.
 *
 * Returns `null` for empty input and for unparseable input alike; callers that need
 * to tell those apart should check `input.trim() === ""` themselves.
 *
 * The last `.` or `,` is treated as the decimal separator, **unless** all of:
 *   (a) exactly 3 digits follow it, to end of string
 *   (b) at least one digit precedes it
 *   (c) the other separator character appears nowhere in the input
 *   (d) what precedes it is not a bare digit run starting with `0`
 * in which case it is a grouping separator.
 *
 * So `1.234` and `1,234` are 1234, while `0,999` is 0.999 (rule d) and `1,234.567`
 * is 1234.567 (rule c). See parse_amount.test.ts for the full table.
 *
 * Rule (d) is anchored to the *whole* integer part, not to the last group. Anchored
 * per-group it also fired on the `000` inside `5.000.000`, which then parsed as
 * 5000 — a silent factor-of-1000 error on the most ordinary peso amount there is.
 */
export function parseAmount(input: string): number | null {
  if (typeof input !== "string") return null;

  let s = input.replace(NOISE, "").trim();
  if (s === "") return null;

  // Pull off a leading sign. Negatives are the input component's business to
  // reject (via `min`), not the parser's — this stays a pure lexer.
  let sign = 1;
  if (s.startsWith("-")) {
    sign = -1;
    s = s.slice(1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
  }

  if (s === "" || !/^[0-9.,]+$/.test(s)) return null;

  // Adjacent separators ("1..2", "1,,2") are never a real number.
  if (/[.,]{2}/.test(s)) return null;

  // A trailing separator is someone mid-typing: "1." is 1.
  if (s.endsWith(".") || s.endsWith(",")) s = s.slice(0, -1);
  if (s === "") return null;

  const lastSepIndex = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));

  let intPart: string;
  let fracPart: string;

  if (lastSepIndex === -1) {
    intPart = s;
    fracPart = "";
  } else {
    const decimalChar = s[lastSepIndex];
    const otherChar = decimalChar === "." ? "," : ".";
    const before = s.slice(0, lastSepIndex);
    const after = s.slice(lastSepIndex + 1);

    const looksLikeGrouping =
      after.length === 3 && // (a) exactly three digits follow
      before.length > 0 && // (b) something precedes it
      !s.includes(otherChar) && // (c) only one separator character in play
      !/^0\d*$/.test(before); // (d) integer part isn't a bare 0-leading digit run

    if (looksLikeGrouping) {
      intPart = s;
      fracPart = "";
    } else {
      intPart = before;
      fracPart = after;
    }
  }

  // Mixing both separators inside the integer part means the grouping is
  // incoherent ("1.2.3,4,5") — reject rather than silently invent a number.
  if (intPart.includes(".") && intPart.includes(",")) return null;

  intPart = intPart.replace(/[.,]/g, ""); // remaining separators are grouping

  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(fracPart)) return null;
  if (intPart === "" && fracPart === "") return null;

  const value = Number(`${intPart || "0"}.${fracPart || "0"}`);
  if (!Number.isFinite(value)) return null;

  const factor = 10 ** DECIMAL_PLACES;
  return (sign * Math.round(value * factor)) / factor;
}
