import { isLocaleSegment, type LocaleSegment } from "./locales";

/**
 * Put a path into a different language, keeping everything after the segment.
 *
 * Written as a general swap even though the app has exactly one page, because
 * the shortcut — `startsWith("/es")` — is wrong in a way that only shows up
 * later: it corrupts `/espanol` into `/enpanol`. Splitting on `/` and testing
 * the first segment for membership is the same length and cannot do that.
 *
 * A path with no locale segment yet gets one prefixed, so the same function
 * serves the language picker and any future entry point that has to build a
 * localised URL from a bare one.
 */
export const withLocaleSegment = (
  pathname: string,
  segment: LocaleSegment
): string => {
  const parts = pathname.split("/");

  if (isLocaleSegment(parts[1])) {
    parts[1] = segment;
    return parts.join("/");
  }

  return pathname === "/" ? `/${segment}` : `/${segment}${pathname}`;
};
