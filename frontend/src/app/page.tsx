import LatestRateDisplay from "@/components/LatestRateDisplay";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { ExchangeRateProvider } from "@/contexts/ExchangeRateContext";

export default function Home() {
  return (
    <div className="container mx-auto" style={{ maxWidth: "800px" }}>
      <div className="row">
        <div className="col border m-2 p-2">
          <h1 className="p-2 mb-2">Dollar Blue</h1>
          <ExchangeRateProvider>
            <LatestRateDisplay />
            <Converter />
            <PaymentSplitter />
            {/* <ExchangeRatesTable /> */}
            {/* <Graph /> */}
          </ExchangeRateProvider>
        </div>
      </div>
    </div>
  );
}
