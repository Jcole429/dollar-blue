import { Suspense } from "react";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { CurrentExchangeRateProvider } from "@/contexts/CurrentExchangeRateContext";
import { ExchangeRateToUseProvider } from "@/contexts/ExchangeRateToUseContext";
import RateSelector from "@/components/RateSelector";
import LatestRateDisplay from "@/components/LatestRateDisplay";
import RateLoadError from "@/components/RateLoadError";
import LanguageSelector from "@/components/LanguageSelector";
import RatesSkeletonLabel from "@/components/RatesSkeletonLabel";
import {
  CURRENT_RATE_REVALIDATE_SECONDS,
  fetchCurrentRates,
} from "@/lib/rates_api";
import { PANEL_CLASS } from "@/utils/styles";

// No resource hints for dolarapi or argentinadatos: the browser never contacts
// either. Both are reached server-side, and every request the client makes goes
// to this app's own routes. The one cross-origin script left is Vercel
// analytics, which is deliberately loaded after hydration and should not be
// promoted ahead of anything on the critical path.
export default function Home() {
  return (
    <div className="container border m-2 p-2">
      {/* Kept for document structure and screen readers; the title is
          deliberately not shown (commit 023ab7e). The product name is a proper
          noun, so it reads the same in both languages. */}
      <h1 className="visually-hidden">Dollar Blue</h1>
      <div className="d-flex justify-content-end px-2 pb-2">
        <LanguageSelector />
      </div>
      <Suspense fallback={<RatesSkeleton />}>
        <Rates />
      </Suspense>
    </div>
  );
}

/**
 * Quotes are fetched here, on the server, rather than from a `useEffect` after
 * hydration. That removes the download → parse → hydrate → fetch waterfall from
 * the load path entirely, and Next's data cache collapses a burst of visitors
 * into one upstream request per revalidation window.
 */
async function Rates() {
  const initialRates = await fetchCurrentRates({
    next: { revalidate: CURRENT_RATE_REVALIDATE_SECONDS },
  });

  return (
    <CurrentExchangeRateProvider initialRates={initialRates}>
      <ExchangeRateToUseProvider>
        <RateLoadError />
        <div className="row px-2">
          <div className="col-lg-4">
            <div className="row">
              <div className="col">
                <LatestRateDisplay rateType="blue" />
              </div>
              <div className="col">
                <LatestRateDisplay rateType="crypto" />
              </div>
            </div>
          </div>
          <div className="col">
            <RateSelector />
            <Converter />
            <PaymentSplitter />
          </div>
        </div>
      </ExchangeRateToUseProvider>
    </CurrentExchangeRateProvider>
  );
}

/** Holds the page's shape while the first quote is in flight. */
function RatesSkeleton() {
  return (
    <div className="row px-2">
      <RatesSkeletonLabel />
      <div className="col-lg-4" aria-hidden="true">
        <div className="row">
          <div className="col">
            <div className={`${PANEL_CLASS} py-5`} />
          </div>
          <div className="col">
            <div className={`${PANEL_CLASS} py-5`} />
          </div>
        </div>
      </div>
      <div className="col" aria-hidden="true">
        <div className={`${PANEL_CLASS} py-5`} />
      </div>
    </div>
  );
}
