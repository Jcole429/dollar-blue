import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocaleSegment } from "@/i18n/locales";
import { resolveLocaleSegment } from "@/i18n/negotiate_locale";

/**
 * Everything that is not one of the two pages ends up here.
 *
 * `/` is the main case: it has no page of its own and exists to work out which
 * language the reader wants, so that neither `/es` nor `/en` has to read a
 * request header and give up being static HTML.
 *
 * The rest is the app having exactly two URLs. There is no `/about` to be
 * missing, so a path that is not `/es` or `/en` is not a broken link to a page
 * — there are no other pages. Answering those with a 404 is technically honest
 * and practically useless: it hands someone a dead end when the only thing they
 * could possibly have wanted is one of the two pages that exist. They get sent
 * to the one in their language instead.
 *
 * Everything decidable is decided in `resolveLocaleSegment`, which is pure and
 * is where the tests live. What is left here is the plumbing that cannot be
 * exercised without a request object.
 */
export function middleware(request: NextRequest) {
  const [, first, ...rest] = request.nextUrl.pathname.split("/");

  // A real page, reached directly. The matcher below should already have kept
  // these out; this is the belt to its braces, and it is what stops a stray
  // match from redirecting a good URL onto itself forever.
  if (isLocaleSegment(first) && rest.length === 0) return NextResponse.next();

  // A path already carrying a language keeps it — someone at `/es/algo` has
  // told us which one they read, whatever the rest of the path was meant to be.
  const segment = isLocaleSegment(first)
    ? first
    : resolveLocaleSegment(
        request.cookies.get(LOCALE_COOKIE)?.value,
        request.headers.get("accept-language")
      );

  // Cloned rather than built, so any query string survives the hop.
  const url = request.nextUrl.clone();
  url.pathname = `/${segment}`;

  // 307 and never 308. Browsers cache a permanent redirect for a long time and
  // often indefinitely, so a reader whose browser learns `/ → /es` permanently
  // could never be negotiated again, or moved by changing their own language
  // settings. Passed explicitly even though it is the default here, because
  // which status this is happens to be the load-bearing decision.
  const response = NextResponse.redirect(url, 307);

  // The answer is a function of a cookie and a request header, so nothing in
  // between may hand it to the next person: without this a shared proxy would
  // pin the first visitor's language for everyone behind it.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Accept-Language, Cookie");

  return response;
}

/**
 * Every path except the two real pages and the things that are not pages.
 *
 * `es$` and `en$` are the point of the lookahead: middleware runs ahead of the
 * CDN, so matching `/es` and `/en` would put a function invocation in front of
 * every view of what are otherwise two static files. Excluding them keeps the
 * common path free and leaves middleware handling only `/` and the URLs that
 * would otherwise be dead ends. The trailing `\..*` clause covers favicon.ico
 * and anything else with an extension.
 *
 * Must stay a literal: Next reads this statically, so it cannot be built from
 * `LOCALE_SEGMENTS`. A third language means adding a branch here by hand — the
 * test in the curl matrix is what catches forgetting.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|es$|en$|.*\\..*).*)"],
};
