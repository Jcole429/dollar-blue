import LatestRateDisplayBlue from "@/components/LatestRateDisplayBlue";
import LatestRateDisplayCrypto from "@/components/LatestRateDisplayCrypto";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { CurrentExchangeRateProvider } from "@/contexts/CurrentExchangeRateContext";

export default function Home() {
  return (
    <div className="container mx-auto" style={{ maxWidth: "800px" }}>
      <div className="row">
        <div className="col border m-2 p-2">
          <h1 className="p-2 mb-2">Dollar Blue</h1>
          <CurrentExchangeRateProvider>
            <ExchangeRateToUseProvider>
            <LatestRateDisplayBlue />
            <LatestRateDisplayCrypto />
            <Converter />
            <PaymentSplitter />
            {/* <ExchangeRatesTable /> */}
            {/* <Graph /> */}
            </ExchangeRateToUseProvider>
          </CurrentExchangeRateProvider>
        </div>
      </div>
    </div>
  );
}
