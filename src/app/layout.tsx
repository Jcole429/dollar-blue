import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LocaleProvider } from "@/i18n/LocaleContext";
import { DEFAULT_LOCALE } from "@/i18n/locales";

const inter = Inter({ subsets: ["latin"] });

// Metadata is emitted during the static render, before any client preference is
// known, so it stays in the default language. Localising it would mean reading a
// cookie on the server and giving up the cached HTML the whole page is built on.
export const metadata: Metadata = {
  title: "Dollar Blue",
  description: "Cotización del dólar y conversor entre pesos y dólares",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Rendered as the default and rewritten by LocaleProvider once the stored
    // preference is read; React does not reconcile it, so the effect owns it.
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body className={inter.className}>
        <LocaleProvider>
          <main>{children}</main>
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
