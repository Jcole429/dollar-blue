import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.scss";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LocaleProvider } from "@/i18n/LocaleContext";
import {
  LOCALE_SEGMENTS,
  SEGMENT_TO_LOCALE,
  isLocaleSegment,
  type Locale,
} from "@/i18n/locales";
import { MESSAGES } from "@/i18n/messages";
import { SITE_URL } from "@/lib/site_url";

const inter = Inter({ subsets: ["latin"] });

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

/**
 * The root layout, one directory further down than one usually sits.
 *
 * It has to be here rather than at `app/`, because Next takes the first layout
 * it finds walking down as the root, and a layout above `[locale]` can never
 * see the segment — which would leave `<html lang>` a fixed default corrected
 * after hydration, the exact thing this arrangement exists to remove.
 *
 * One consequence worth knowing before it bites: `app/not-found.tsx` must not
 * be added. A custom root not-found is resolved without descending into
 * `[locale]`, so it finds no root layout and fails the build outright. Next's
 * own unstyled 404 is served instead, and a localised one — if it is ever
 * wanted — belongs at `app/[locale]/not-found.tsx`.
 */

/** Every page there is: two languages, two prerendered HTML files. */
export function generateStaticParams() {
  return LOCALE_SEGMENTS.map((locale) => ({ locale }));
}

/**
 * Anything that is not one of those two is a 404 answered from the build,
 * rather than a render performed on demand and thrown away. There is nothing on
 * the far side of this route worth generating for a URL nobody holds.
 */
export const dynamicParams = false;

/**
 * `params.locale` is typed `string` because that is what Next hands a dynamic
 * segment. `dynamicParams = false` makes the failing branch unreachable in
 * practice; the narrowing is what lets everything below index the table at all.
 */
const localeFromParams = (segment: string): Locale => {
  if (!isLocaleSegment(segment)) notFound();
  return SEGMENT_TO_LOCALE[segment];
};

export function generateMetadata({ params }: LocaleLayoutProps): Metadata {
  const locale = localeFromParams(params.locale);

  // Built from the segment list rather than written out, so a third language
  // cannot ship announcing only two.
  const languages: Record<string, string> = Object.fromEntries(
    LOCALE_SEGMENTS.map((segment): [string, string] => [
      SEGMENT_TO_LOCALE[segment],
      `/${segment}`,
    ])
  );
  // `/` is the negotiating entry point, which is exactly what x-default is
  // for: where to send a reader whose language none of the alternates claim.
  languages["x-default"] = "/";

  return {
    metadataBase: SITE_URL,
    // A proper noun: it reads the same in both languages, same as the <h1>.
    title: "Dollar Blue",
    description: MESSAGES[locale].app.description,
    alternates: {
      // Each language is its own canonical. Pointing both at `/` would ask a
      // search engine to collapse them into one page, which is the opposite of
      // why they were separated.
      canonical: `/${params.locale}`,
      languages,
    },
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = localeFromParams(params.locale);

  // Server-rendered, and right on the first byte. This used to be the default
  // locale with an effect correcting it after hydration; the path segment is
  // what removed the correction without giving up the prerendered HTML. It is
  // also why `suppressHydrationWarning` is gone from here — server and client
  // now agree, and leaving it would only hide a real mismatch later.
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <LocaleProvider locale={locale}>
          <main>{children}</main>
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
