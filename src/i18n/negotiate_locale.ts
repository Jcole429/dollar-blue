import {
  DEFAULT_LOCALE_SEGMENT,
  LOCALES,
  LOCALE_TO_SEGMENT,
  isLocaleSegment,
  type LocaleSegment,
} from "./locales";

/**
 * Which language a request is asking for.
 *
 * Kept pure — no `next/*`, no DOM, nothing request-shaped — because it is the
 * entire decision the middleware makes, and this is where it can be tested.
 * What is left in the middleware is plumbing with no branches in it.
 *
 * Hand-rolled rather than pulled from `negotiator` or `intl-localematcher`: the
 * app has six runtime dependencies, and matching two languages is a header
 * split and a table lookup.
 */

/**
 * `Accept-Language` arrives from the open internet and is parsed on every
 * request to `/`. Chrome's is under a hundred characters; a header several
 * times wider than that is not one a browser sent, and the cheapest correct
 * response is to stop reading and fall back to the default.
 */
const MAX_HEADER_LENGTH = 512;

interface LanguageRange {
  /** Lowercased, so `EN-gb` and `en-GB` compare equal. */
  readonly tag: string;
  readonly q: number;
}

/**
 * Split `Accept-Language` into its ranges, best first.
 *
 * Deliberately lenient about everything RFC 9110 is strict on — spaces around
 * the `=`, a weight that is not a number, a weight above 1 — because rejecting
 * a slightly malformed header costs someone the wrong language while accepting
 * one costs nothing. The single exception is `q=0`, which the spec defines as
 * "not acceptable" and which therefore has to be honoured rather than forgiven.
 */
export const parseAcceptLanguage = (
  header: string | null | undefined
): LanguageRange[] => {
  if (typeof header !== "string") return [];

  const text = header.trim();
  if (text === "" || text.length > MAX_HEADER_LENGTH) return [];

  const ranges: LanguageRange[] = [];

  for (const part of text.split(",")) {
    const [rawTag, ...params] = part.split(";");
    const tag = rawTag.trim().toLowerCase();
    if (tag === "") continue;

    let q = 1;
    for (const param of params) {
      const equals = param.indexOf("=");
      if (equals === -1) continue;
      if (param.slice(0, equals).trim().toLowerCase() !== "q") continue;

      const parsed = Number.parseFloat(param.slice(equals + 1).trim());
      // An unreadable weight leaves the default of 1 rather than dropping the
      // range: a client that meant to state a preference still gets heard.
      if (Number.isFinite(parsed)) q = Math.min(Math.max(parsed, 0), 1);
    }

    if (q === 0) continue;
    ranges.push({ tag, q });
  }

  // `Array.prototype.sort` is required to be stable, which is what makes equal
  // weights fall back to the order the client wrote them in — the tie-break the
  // spec expects.
  return ranges.sort((a, b) => b.q - a.q);
};

/** Derived from `LOCALES`, so a third language needs no edit here. */
const SEGMENT_BY_TAG = new Map(
  LOCALES.map((locale) => [locale.toLowerCase(), LOCALE_TO_SEGMENT[locale]])
);

const SEGMENT_BY_PRIMARY_SUBTAG = new Map(
  LOCALES.map((locale) => [
    locale.toLowerCase().split("-")[0],
    LOCALE_TO_SEGMENT[locale],
  ])
);

/**
 * The RFC 4647 lookup: walk the ranges best first and, for each, try the whole
 * tag before falling back to its primary subtag.
 *
 * That ordering is what sends an `en-GB` reader to `en-US` — the only English
 * on offer — while leaving room for a future `es-ES` to prefer an exact match
 * over `es-AR`. Note it is the first *supported* range that wins, not the first
 * listed: a French browser that also accepts English gets English.
 */
export const matchAcceptLanguage = (
  header: string | null | undefined
): LocaleSegment | null => {
  for (const { tag } of parseAcceptLanguage(header)) {
    // `*` says any language will do, which is what a default is for.
    if (tag === "*") return DEFAULT_LOCALE_SEGMENT;

    const exact = SEGMENT_BY_TAG.get(tag);
    if (exact !== undefined) return exact;

    const primary = SEGMENT_BY_PRIMARY_SUBTAG.get(tag.split("-")[0]);
    if (primary !== undefined) return primary;
  }

  return null;
};

/**
 * Which language to send a reader to when they arrive without one.
 *
 * Cookie, then header, then the default: an explicit choice outranks a browser
 * setting, and the cookie is only ever written by someone clicking the picker.
 * A cookie holding anything else — a stale value, a full tag, someone's idea of
 * a joke — is ignored rather than trusted.
 */
export const resolveLocaleSegment = (
  cookieValue: string | undefined,
  acceptLanguage: string | null | undefined
): LocaleSegment => {
  if (isLocaleSegment(cookieValue)) return cookieValue;
  return matchAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE_SEGMENT;
};
