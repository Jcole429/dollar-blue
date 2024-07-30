import LatestRateDisplay from "@/components/LatestRateDisplay";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { ExchangeRateProvider } from "@/contexts/ExhangeRateContext";

export default function Home() {
  return (
    <div className="container mx-auto m-4" style={{ maxWidth: "800px" }}>
      <div className="row border pt-2">
        <div className="col">
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
