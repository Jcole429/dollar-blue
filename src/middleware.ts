import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/locales";
import { resolveLocaleSegment } from "@/i18n/negotiate_locale";

/**
 * `/` has no page of its own. It exists to work out which language the reader
 * wants and hand them to that language's prerendered route, so that neither
 * `/es` nor `/en` has to read a request header and give up being static HTML.
 *
 * Everything decidable is decided in `resolveLocaleSegment`, which is pure and
 * is where the tests live. What is left here is the handful of lines that
 * cannot be exercised without a request object, and they contain no branches —
 * that split is deliberate, not an untested gap.
 */
export function middleware(request: NextRequest) {
  const segment = resolveLocaleSegment(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language")
  );

  // Cloned rather than built, so any query string survives the hop.
  const url = request.nextUrl.clone();
  url.pathname = `/${segment}`;

  // 307 and never 301 or 308. Browsers cache a permanent redirect for a long
  // time and often indefinitely, so a reader whose browser learns `/ → /es`
  // permanently could never be negotiated again, or moved by changing their own
  // language settings. Passed explicitly even though it is the default here,
  // because which status this is happens to be the load-bearing decision.
  const response = NextResponse.redirect(url, 307);

  // The answer is a function of a cookie and a request header, so nothing in
  // between may hand it to the next person: without this a shared proxy would
  // pin the first visitor's language for everyone behind it.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Accept-Language, Cookie");

  return response;
}

/**
 * Only `/`, deliberately.
 *
 * The negative-lookahead matcher this is usually written with runs on every
 * HTML request, including `/es` and `/en` — the two fully prerendered pages the
 * whole arrangement exists to protect. Middleware runs ahead of the CDN, so
 * that would put a function invocation in front of every page view of a static
 * site to do work that only ever matters at the root. Naming the one path
 * excludes `/api`, `/_next` and every asset by construction, rather than by a
 * regex somebody has to keep correct.
 *
 * Note this must never fall through to `NextResponse.next()`: `/` has no page
 * behind it, so anything but a redirect is a 404.
 */
export const config = { matcher: ["/"] };
