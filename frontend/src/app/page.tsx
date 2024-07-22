import ExchangeRatesTable from "../components/ExchangeRatesTable";
import Graph from "../components/Graph";
import LatestRateDisplay from "@/components/LatestRateDisplay";
import Converter from "@/components/Converter";
import PaymentSplitter from "@/components/PaymentSplitter";
import { ExchangeRateProvider } from "@/contexts/ExhangeRateContext";

export default function Home() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight">
        Latest Argentinian Pesos to USD Exchange Rates
      </h1>
      <ExchangeRateProvider>
        <LatestRateDisplay />
        <Converter />
        <PaymentSplitter />
        {/* <ExchangeRatesTable /> */}
        {/* <Graph /> */}
      </ExchangeRateProvider>
    </div>
  );
}
