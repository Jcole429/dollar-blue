import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { CurrentExchangeRateProvider } from "@/contexts/CurrentExchangeRateContext";
import { ExchangeRateToUseProvider } from "@/contexts/ExchangeRateToUseContext";
import RateSelector from "@/components/RateSelector";
import LatestRateDisplay from "@/components/LatestRateDisplay";

export default function Home() {
  return (
    <CurrentExchangeRateProvider>
      <ExchangeRateToUseProvider>
        <div className="container border m-2 p-2">
          {/* Kept for document structure and screen readers; the title is
              deliberately not shown (commit 023ab7e). */}
          <h1 className="visually-hidden">Dollar Blue</h1>
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
        </div>
      </ExchangeRateToUseProvider>
    </CurrentExchangeRateProvider>
  );
}
