import LatestRateDisplayBlue from "@/components/LatestRateDisplayBlue";
import LatestRateDisplayCrypto from "@/components/LatestRateDisplayCrypto";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { CurrentExchangeRateProvider } from "@/contexts/CurrentExchangeRateContext";
import { ExchangeRateToUseProvider } from "@/contexts/ExchangeRateToUseContext";
import RateSelector from "@/components/RateSelector";

export default function Home() {
  return (
    <CurrentExchangeRateProvider>
      <ExchangeRateToUseProvider>
        <div
          className="container mx-auto border m-2 p-2"
          // style={{ maxWidth: "800px" }}
        >
          <div className="row">
            <div className="col">
              <h1 className="p-2 mb-2">Dollar Blue</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <LatestRateDisplayBlue />
              <LatestRateDisplayCrypto />
            </div>
            <div className="col">
              <RateSelector />
              <Converter />
              <PaymentSplitter />
              {/* <ExchangeRatesTable /> */}
              {/* <Graph /> */}
            </div>
          </div>
        </div>
      </ExchangeRateToUseProvider>
    </CurrentExchangeRateProvider>
  );
}
