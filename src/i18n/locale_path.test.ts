import { describe, expect, it } from "vitest";
import { withLocaleSegment } from "./locale_path";

describe("withLocaleSegment", () => {
  it.each([
    ["swaps one language for the other", "/es", "en", "/en"],
    ["swaps back", "/en", "es", "/es"],
    ["leaves a path already in that language alone", "/es", "es", "/es"],
    ["prefixes the root", "/", "en", "/en"],
    ["keeps everything after the segment", "/es/algo", "en", "/en/algo"],
    ["keeps a deep path", "/es/a/b/c", "en", "/en/a/b/c"],
    ["keeps a trailing slash", "/es/", "en", "/en/"],
    ["prefixes a path that has no locale yet", "/algo", "en", "/en/algo"],
    // The case the whole function exists for: a `startsWith("/es")` swap turns
    // this into "/enpanol".
    ["does not swap inside a longer segment", "/espanol", "en", "/en/espanol"],
    ["does not swap a nested segment", "/algo/es", "en", "/en/algo/es"],
  ])("%s", (_name, pathname, segment, expected) => {
    expect(withLocaleSegment(pathname, segment as "es" | "en")).toBe(expected);
  });
});
